package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "training_resumes")
public class TrainingResume {
    @Id
    private String id;
    private String filename;
    private String extractedText;
    private LocalDateTime createdAt;
    private String type; // e.g., "Good Example", "Bad Example" (Optional for future)

    public TrainingResume() {
        this.createdAt = LocalDateTime.now();
    }

    public TrainingResume(String filename, String extractedText) {
        this.filename = filename;
        this.extractedText = extractedText;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
