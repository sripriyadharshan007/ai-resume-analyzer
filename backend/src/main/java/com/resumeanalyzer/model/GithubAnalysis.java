package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "github_analyses")
public class GithubAnalysis {

    @Id
    private String id;
    private String userId;
    private String githubUsername;
    private String avatarUrl;
    private String name;
    private int publicRepos;
    private int followers;
    private int githubScore;
    private List<String> topLanguages = new ArrayList<>();
    private int totalStars;
    private int totalForks;
    private String readmeQuality;
    private List<String> strengths = new ArrayList<>();
    private List<String> weaknesses = new ArrayList<>();
    private List<ProjectRecommendation> suggestedProjects = new ArrayList<>();
    private Instant analyzedAt = Instant.now();

    public GithubAnalysis() {}

    public GithubAnalysis(String id, String userId, String githubUsername, String avatarUrl, String name,
                          int publicRepos, int followers, int githubScore, List<String> topLanguages,
                          int totalStars, int totalForks, String readmeQuality, List<String> strengths,
                          List<String> weaknesses, List<ProjectRecommendation> suggestedProjects, Instant analyzedAt) {
        this.id = id;
        this.userId = userId;
        this.githubUsername = githubUsername;
        this.avatarUrl = avatarUrl;
        this.name = name;
        this.publicRepos = publicRepos;
        this.followers = followers;
        this.githubScore = githubScore;
        this.topLanguages = topLanguages;
        this.totalStars = totalStars;
        this.totalForks = totalForks;
        this.readmeQuality = readmeQuality;
        this.strengths = strengths;
        this.weaknesses = weaknesses;
        this.suggestedProjects = suggestedProjects;
        this.analyzedAt = analyzedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getGithubUsername() { return githubUsername; }
    public void setGithubUsername(String githubUsername) { this.githubUsername = githubUsername; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getPublicRepos() { return publicRepos; }
    public void setPublicRepos(int publicRepos) { this.publicRepos = publicRepos; }

    public int getFollowers() { return followers; }
    public void setFollowers(int followers) { this.followers = followers; }

    public int getGithubScore() { return githubScore; }
    public void setGithubScore(int githubScore) { this.githubScore = githubScore; }

    public List<String> getTopLanguages() { return topLanguages; }
    public void setTopLanguages(List<String> topLanguages) { this.topLanguages = topLanguages; }

    public int getTotalStars() { return totalStars; }
    public void setTotalStars(int totalStars) { this.totalStars = totalStars; }

    public int getTotalForks() { return totalForks; }
    public void setTotalForks(int totalForks) { this.totalForks = totalForks; }

    public String getReadmeQuality() { return readmeQuality; }
    public void setReadmeQuality(String readmeQuality) { this.readmeQuality = readmeQuality; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }

    public List<ProjectRecommendation> getSuggestedProjects() { return suggestedProjects; }
    public void setSuggestedProjects(List<ProjectRecommendation> suggestedProjects) { this.suggestedProjects = suggestedProjects; }

    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant analyzedAt) { this.analyzedAt = analyzedAt; }

    public static class ProjectRecommendation {
        private String title;
        private String description;
        private String difficulty;
        private String technologies;

        public ProjectRecommendation() {}

        public ProjectRecommendation(String title, String description, String difficulty, String technologies) {
            this.title = title;
            this.description = description;
            this.difficulty = difficulty;
            this.technologies = technologies;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public String getTechnologies() { return technologies; }
        public void setTechnologies(String technologies) { this.technologies = technologies; }
    }
}
