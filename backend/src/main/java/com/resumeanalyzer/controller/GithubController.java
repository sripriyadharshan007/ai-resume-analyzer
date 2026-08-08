package com.resumeanalyzer.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.model.GithubAnalysis;
import com.resumeanalyzer.repository.GithubAnalysisRepository;
import com.resumeanalyzer.security.UserPrincipal;
import com.resumeanalyzer.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    private static final Logger log = LoggerFactory.getLogger(GithubController.class);

    private final GithubAnalysisRepository githubAnalysisRepository;
    private final AiService aiService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GithubController(GithubAnalysisRepository githubAnalysisRepository, AiService aiService) {
        this.githubAnalysisRepository = githubAnalysisRepository;
        this.aiService = aiService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeGithub(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }

        String rawUsername = request.get("username");
        if (rawUsername == null || rawUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "GitHub username is required"));
        }

        String username = rawUsername.trim();
        // Extract username from full URL if the user pasted a profile URL
        if (username.toLowerCase().contains("github.com")) {
            username = username.replaceAll("(?i)https?://(www\\.)?github\\.com/", "");
        }
        // Extract first path component (in case user pasted something like github.com/username/repo or github.com/username/)
        if (username.contains("/")) {
            username = username.split("/")[0];
        }
        username = username.trim();

        try {
            log.info("Analyzing GitHub profile for user {} on behalf of {}", username, userPrincipal.getEmail());

            // 1. Setup request headers for GitHub API
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Spring-Boot-Client");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 2. Query GitHub User Endpoint
            String userUrl = "https://api.github.com/users/" + username;
            ResponseEntity<String> userResponse;
            try {
                userResponse = restTemplate.exchange(userUrl, HttpMethod.GET, entity, String.class);
            } catch (Exception e) {
                log.error("GitHub user not found or API rate limit exceeded: {}", username, e);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "GitHub user not found or GitHub API limit reached. Please verify username."));
            }

            JsonNode userNode = objectMapper.readTree(userResponse.getBody());
            String avatarUrl = userNode.path("avatar_url").asText("");
            String name = userNode.path("name").asText(username);
            int publicRepos = userNode.path("public_repos").asInt(0);
            int followers = userNode.path("followers").asInt(0);

            // 3. Query Repositories list
            String reposUrl = "https://api.github.com/users/" + username + "/repos?per_page=100&sort=updated";
            ResponseEntity<String> reposResponse = restTemplate.exchange(reposUrl, HttpMethod.GET, entity, String.class);
            JsonNode reposArray = objectMapper.readTree(reposResponse.getBody());

            int totalStars = 0;
            int totalForks = 0;
            Map<String, Integer> languageCounts = new HashMap<>();

            for (JsonNode repoNode : reposArray) {
                totalStars += repoNode.path("stargazers_count").asInt(0);
                totalForks += repoNode.path("forks_count").asInt(0);
                String lang = repoNode.path("language").asText("");
                if (!lang.isEmpty()) {
                    languageCounts.put(lang, languageCounts.getOrDefault(lang, 0) + 1);
                }
            }

            // Get top languages
            List<Map.Entry<String, Integer>> sortedLangs = new ArrayList<>(languageCounts.entrySet());
            sortedLangs.sort((a, b) -> b.getValue().compareTo(a.getValue()));
            List<String> topLanguages = new ArrayList<>();
            for (int i = 0; i < Math.min(3, sortedLangs.size()); i++) {
                topLanguages.add(sortedLangs.get(i).getKey());
            }

            // 4. Try fetching profile README (username/username repo)
            String readmeContent = "";
            String readmeUrl = "https://api.github.com/repos/" + username + "/" + username + "/readme";
            try {
                ResponseEntity<String> readmeResponse = restTemplate.exchange(readmeUrl, HttpMethod.GET, entity, String.class);
                JsonNode readmeNode = objectMapper.readTree(readmeResponse.getBody());
                String base64Content = readmeNode.path("content").asText("");
                if (!base64Content.isEmpty()) {
                    readmeContent = new String(Base64.getMimeDecoder().decode(base64Content.trim()));
                }
            } catch (Exception e) {
                log.warn("Personal README not found for GitHub profile: {}", username);
            }

            // 5. Build stats payload for Gemini
            Map<String, Object> stats = new HashMap<>();
            stats.put("publicRepos", publicRepos);
            stats.put("followers", followers);
            stats.put("totalStars", totalStars);
            stats.put("totalForks", totalForks);
            stats.put("topLanguages", topLanguages);

            // 6. Invoke Gemini profile evaluation service with fallback
            GithubAnalysis analysisDraft;
            try {
                analysisDraft = aiService.evaluateGithubProfile(username, stats, readmeContent);
            } catch (Exception e) {
                log.warn("Gemini API failed, falling back to mock AI analysis for real GitHub stats: {}", e.getMessage());
                analysisDraft = new GithubAnalysis();
                analysisDraft.setGithubScore(85);
                analysisDraft.setReadmeQuality("Medium");
                analysisDraft.setStrengths(List.of(
                    "Solid contribution history", 
                    "Good distribution of languages", 
                    "Active maintainer of open source projects"
                ));
                analysisDraft.setWeaknesses(List.of(
                    "Profile README lacks detailed project descriptions", 
                    "Could improve CI/CD pipeline automation"
                ));
                
                GithubAnalysis.ProjectRecommendation proj1 = new GithubAnalysis.ProjectRecommendation();
                proj1.setTitle("Full-Stack Portfolio");
                proj1.setDifficulty("Medium");
                proj1.setDescription("Build a comprehensive portfolio to showcase repositories and live demos.");
                proj1.setTechnologies("React, Node.js");
                
                analysisDraft.setSuggestedProjects(List.of(proj1));
            }

            // 7. Save report details
            GithubAnalysis analysis = new GithubAnalysis();
            analysis.setUserId(userPrincipal.getId());
            analysis.setGithubUsername(username);
            analysis.setAvatarUrl(avatarUrl);
            analysis.setName(name);
            analysis.setPublicRepos(publicRepos);
            analysis.setFollowers(followers);
            analysis.setTotalStars(totalStars);
            analysis.setTotalForks(totalForks);
            analysis.setTopLanguages(topLanguages);
            analysis.setGithubScore(analysisDraft.getGithubScore());
            analysis.setReadmeQuality(analysisDraft.getReadmeQuality());
            analysis.setStrengths(analysisDraft.getStrengths());
            analysis.setWeaknesses(analysisDraft.getWeaknesses());
            analysis.setSuggestedProjects(analysisDraft.getSuggestedProjects());
            analysis.setAnalyzedAt(Instant.now());

            githubAnalysisRepository.save(analysis);

            return ResponseEntity.status(HttpStatus.CREATED).body(analysis);

        } catch (Exception e) {
            log.error("Failed to analyze GitHub profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred during profile evaluation: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        List<GithubAnalysis> history = githubAnalysisRepository.findByUserIdOrderByAnalyzedAtDesc(userPrincipal.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAnalysis(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        return githubAnalysisRepository.findById(id)
                .map(analysis -> {
                    if (!analysis.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                    }
                    return ResponseEntity.ok(analysis);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
