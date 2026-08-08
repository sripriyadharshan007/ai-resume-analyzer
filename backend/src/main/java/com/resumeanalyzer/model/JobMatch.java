package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "job_matches")
public class JobMatch {

    @Id
    private String id;
    private String userId;
    private String jobTitle;
    private String companyName;
    private int compatibilityScore;
    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<LearningResource> recommendedResources = new ArrayList<>();
    private Instant matchedAt = Instant.now();

    public JobMatch() {}

    public JobMatch(String id, String userId, String jobTitle, String companyName, int compatibilityScore,
                    List<String> matchedSkills, List<String> missingSkills,
                    List<LearningResource> recommendedResources, Instant matchedAt) {
        this.id = id;
        this.userId = userId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.compatibilityScore = compatibilityScore;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.recommendedResources = recommendedResources;
        this.matchedAt = matchedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public int getCompatibilityScore() { return compatibilityScore; }
    public void setCompatibilityScore(int compatibilityScore) { this.compatibilityScore = compatibilityScore; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<LearningResource> getRecommendedResources() { return recommendedResources; }
    public void setRecommendedResources(List<LearningResource> recommendedResources) { this.recommendedResources = recommendedResources; }

    public Instant getMatchedAt() { return matchedAt; }
    public void setMatchedAt(Instant matchedAt) { this.matchedAt = matchedAt; }

    public static class LearningResource {
        private String title;
        private String provider;
        private String url;
        private String difficulty;

        public LearningResource() {}

        public LearningResource(String title, String provider, String url, String difficulty) {
            this.title = title;
            this.provider = provider;
            this.url = url;
            this.difficulty = difficulty;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    }
}
