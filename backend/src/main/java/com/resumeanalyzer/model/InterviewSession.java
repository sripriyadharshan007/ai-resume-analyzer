package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "interview_sessions")
public class InterviewSession {
    @Id
    private String id;
    private String userId;
    private String resumeId;
    private String targetJobTitle;
    private List<Question> questions = new ArrayList<>();
    private List<Answer> answers = new ArrayList<>();
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED
    private Instant createdAt = Instant.now();
    private Instant completedAt;

    public InterviewSession() {}

    public InterviewSession(String id, String userId, String resumeId, String targetJobTitle,
                            List<Question> questions, List<Answer> answers, String status,
                            Instant createdAt, Instant completedAt) {
        this.id = id;
        this.userId = userId;
        this.resumeId = resumeId;
        this.targetJobTitle = targetJobTitle;
        this.questions = questions;
        this.answers = answers;
        this.status = status;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    public static InterviewSessionBuilder builder() {
        return new InterviewSessionBuilder();
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

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public static class Question {
        private String questionId;
        private String questionText;
        private String category;
        private String difficulty;

        public Question() {}

        public Question(String questionId, String questionText, String category, String difficulty) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.category = category;
            this.difficulty = difficulty;
        }

        public String getQuestionId() {
            return questionId;
        }

        public void setQuestionId(String questionId) {
            this.questionId = questionId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }
    }

    public static class Answer {
        private String questionId;
        private String userAnswerText;
        private int aiScore;
        private String aiFeedback;
        private List<String> idealKeywords = new ArrayList<>();

        public Answer() {}

        public Answer(String questionId, String userAnswerText, int aiScore, String aiFeedback, List<String> idealKeywords) {
            this.questionId = questionId;
            this.userAnswerText = userAnswerText;
            this.aiScore = aiScore;
            this.aiFeedback = aiFeedback;
            this.idealKeywords = idealKeywords;
        }

        public String getQuestionId() {
            return questionId;
        }

        public void setQuestionId(String questionId) {
            this.questionId = questionId;
        }

        public String getUserAnswerText() {
            return userAnswerText;
        }

        public void setUserAnswerText(String userAnswerText) {
            this.userAnswerText = userAnswerText;
        }

        public int getAiScore() {
            return aiScore;
        }

        public void setAiScore(int aiScore) {
            this.aiScore = aiScore;
        }

        public String getAiFeedback() {
            return aiFeedback;
        }

        public void setAiFeedback(String aiFeedback) {
            this.aiFeedback = aiFeedback;
        }

        public List<String> getIdealKeywords() {
            return idealKeywords;
        }

        public void setIdealKeywords(List<String> idealKeywords) {
            this.idealKeywords = idealKeywords;
        }
    }

    public static class InterviewSessionBuilder {
        private String id;
        private String userId;
        private String resumeId;
        private String targetJobTitle;
        private List<Question> questions = new ArrayList<>();
        private List<Answer> answers = new ArrayList<>();
        private String status = "IN_PROGRESS";
        private Instant createdAt = Instant.now();
        private Instant completedAt;

        InterviewSessionBuilder() {}

        public InterviewSessionBuilder id(String id) {
            this.id = id;
            return this;
        }

        public InterviewSessionBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public InterviewSessionBuilder resumeId(String resumeId) {
            this.resumeId = resumeId;
            return this;
        }

        public InterviewSessionBuilder targetJobTitle(String targetJobTitle) {
            this.targetJobTitle = targetJobTitle;
            return this;
        }

        public InterviewSessionBuilder questions(List<Question> questions) {
            this.questions = questions;
            return this;
        }

        public InterviewSessionBuilder answers(List<Answer> answers) {
            this.answers = answers;
            return this;
        }

        public InterviewSessionBuilder status(String status) {
            this.status = status;
            return this;
        }

        public InterviewSessionBuilder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public InterviewSessionBuilder completedAt(Instant completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public InterviewSession build() {
            return new InterviewSession(id, userId, resumeId, targetJobTitle, questions, answers, status, createdAt, completedAt);
        }
    }
}
