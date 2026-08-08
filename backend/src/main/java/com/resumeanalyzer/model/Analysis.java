package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "analyses")
public class Analysis {
    @Id
    private String id;
    private String userId;
    private String resumeId;
    private String targetJobTitle;
    private int atsScore;
    private List<String> missingSkills = new ArrayList<>();
    private List<ImprovementSuggestion> improvementSuggestions = new ArrayList<>();
    private Instant analyzedAt = Instant.now();

    public Analysis() {}

    public Analysis(String id, String userId, String resumeId, String targetJobTitle, int atsScore,
                    List<String> missingSkills, List<ImprovementSuggestion> improvementSuggestions, Instant analyzedAt) {
        this.id = id;
        this.userId = userId;
        this.resumeId = resumeId;
        this.targetJobTitle = targetJobTitle;
        this.atsScore = atsScore;
        this.missingSkills = missingSkills;
        this.improvementSuggestions = improvementSuggestions;
        this.analyzedAt = analyzedAt;
    }

    public static AnalysisBuilder builder() {
        return new AnalysisBuilder();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getResumeId() {
        return resumeId;
    }

    public void setResumeId(String resumeId) {
        this.resumeId = resumeId;
    }

    public String getTargetJobTitle() {
        return targetJobTitle;
    }

    public void setTargetJobTitle(String targetJobTitle) {
        this.targetJobTitle = targetJobTitle;
    }

    public int getAtsScore() {
        return atsScore;
    }

    public void setAtsScore(int atsScore) {
        this.atsScore = atsScore;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<ImprovementSuggestion> getImprovementSuggestions() {
        return improvementSuggestions;
    }

    public void setImprovementSuggestions(List<ImprovementSuggestion> improvementSuggestions) {
        this.improvementSuggestions = improvementSuggestions;
    }

    public Instant getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(Instant analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public static class ImprovementSuggestion {
        private String section;
        private String currentText;
        private String suggestedText;
        private String impact;
        private String reason;

        public ImprovementSuggestion() {}

        public ImprovementSuggestion(String section, String currentText, String suggestedText, String impact, String reason) {
            this.section = section;
            this.currentText = currentText;
            this.suggestedText = suggestedText;
            this.impact = impact;
            this.reason = reason;
        }

        public String getSection() {
            return section;
        }

        public void setSection(String section) {
            this.section = section;
        }

        public String getCurrentText() {
            return currentText;
        }

        public void setCurrentText(String currentText) {
            this.currentText = currentText;
        }

        public String getSuggestedText() {
            return suggestedText;
        }

        public void setSuggestedText(String suggestedText) {
            this.suggestedText = suggestedText;
        }

        public String getImpact() {
            return impact;
        }

        public void setImpact(String impact) {
            this.impact = impact;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public static class AnalysisBuilder {
        private String id;
        private String userId;
        private String resumeId;
        private String targetJobTitle;
        private int atsScore;
        private List<String> missingSkills = new ArrayList<>();
        private List<ImprovementSuggestion> improvementSuggestions = new ArrayList<>();
        private Instant analyzedAt = Instant.now();

        AnalysisBuilder() {}

        public AnalysisBuilder id(String id) {
            this.id = id;
            return this;
        }

        public AnalysisBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public AnalysisBuilder resumeId(String resumeId) {
            this.resumeId = resumeId;
            return this;
        }

        public AnalysisBuilder targetJobTitle(String targetJobTitle) {
            this.targetJobTitle = targetJobTitle;
            return this;
        }

        public AnalysisBuilder atsScore(int atsScore) {
            this.atsScore = atsScore;
            return this;
        }

        public AnalysisBuilder missingSkills(List<String> missingSkills) {
            this.missingSkills = missingSkills;
            return this;
        }

        public AnalysisBuilder improvementSuggestions(List<ImprovementSuggestion> improvementSuggestions) {
            this.improvementSuggestions = improvementSuggestions;
            return this;
        }

        public AnalysisBuilder analyzedAt(Instant analyzedAt) {
            this.analyzedAt = analyzedAt;
            return this;
        }

        public Analysis build() {
            return new Analysis(id, userId, resumeId, targetJobTitle, atsScore, missingSkills, improvementSuggestions, analyzedAt);
        }
    }
}
