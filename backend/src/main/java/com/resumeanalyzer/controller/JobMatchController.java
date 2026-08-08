package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.CourseRecommendationResponse;
import com.resumeanalyzer.model.JobMatch;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.repository.JobMatchRepository;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.security.UserPrincipal;
import com.resumeanalyzer.service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-match")
public class JobMatchController {

    private final JobMatchRepository jobMatchRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;

    public JobMatchController(JobMatchRepository jobMatchRepository,
                              ResumeRepository resumeRepository,
                              AiService aiService) {
        this.jobMatchRepository = jobMatchRepository;
        this.resumeRepository = resumeRepository;
        this.aiService = aiService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluate(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }

        String jobTitle = request.getOrDefault("jobTitle", "Software Engineer");
        String companyName = request.getOrDefault("companyName", "Target Company");
        String jobDescription = request.get("jobDescription");

        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Job description is required"));
        }

        // Fetch user's latest resume
        List<Resume> resumes = resumeRepository.findByUserId(userPrincipal.getId());
        String resumeText = "";
        if (resumes != null && !resumes.isEmpty()) {
            resumes.sort((a, b) -> b.getUploadedAt().compareTo(a.getUploadedAt()));
            resumeText = resumes.get(0).getRawText();
        }

        if (resumeText.isEmpty()) {
            resumeText = "Software Engineer with hands-on experience in Java, Spring Boot, JavaScript, and database management. " +
                    "Passionate about writing clean, scalable services and designing modular web applications.";
        }

        // 1. Run Job Match profile evaluation
        JobMatch matchDraft = aiService.evaluateJobMatch(resumeText, jobDescription);

        // 2. Fetch learning resources recommendation for missing skills
        List<JobMatch.LearningResource> recommendedResources = new ArrayList<>();
        if (matchDraft.getMissingSkills() != null && !matchDraft.getMissingSkills().isEmpty()) {
            List<CourseRecommendationResponse> courseResponses = aiService.generateCourseRecommendations(matchDraft.getMissingSkills());
            if (courseResponses != null) {
                for (CourseRecommendationResponse courseRes : courseResponses) {
                    if (courseRes.getCourses() != null) {
                        for (CourseRecommendationResponse.Course course : courseRes.getCourses()) {
                            recommendedResources.add(new JobMatch.LearningResource(
                                    course.getTitle(),
                                    course.getProvider(),
                                    course.getUrl(),
                                    course.getDifficulty()
                            ));
                        }
                    }
                }
            }
        }

        // 3. Save matching details
        JobMatch jobMatch = new JobMatch();
        jobMatch.setUserId(userPrincipal.getId());
        jobMatch.setJobTitle(jobTitle);
        jobMatch.setCompanyName(companyName);
        jobMatch.setCompatibilityScore(matchDraft.getCompatibilityScore());
        jobMatch.setMatchedSkills(matchDraft.getMatchedSkills());
        jobMatch.setMissingSkills(matchDraft.getMissingSkills());
        jobMatch.setRecommendedResources(recommendedResources);
        jobMatch.setMatchedAt(Instant.now());

        JobMatch saved = jobMatchRepository.save(jobMatch);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        List<JobMatch> history = jobMatchRepository.findByUserIdOrderByMatchedAtDesc(userPrincipal.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMatch(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        return jobMatchRepository.findById(id)
                .map(match -> {
                    if (!match.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                    }
                    return ResponseEntity.ok(match);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMatch(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        return jobMatchRepository.findById(id)
                .map(match -> {
                    if (!match.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                    }
                    jobMatchRepository.delete(match);
                    return ResponseEntity.ok(Map.of("message", "Match report deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
