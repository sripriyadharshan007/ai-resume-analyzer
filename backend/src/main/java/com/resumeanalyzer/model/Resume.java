package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "resumes")
public class Resume {
    @Id
    private String id;
    private String userId;
    private String fileName;
    private String contentType;
    private long fileSize;
    private String rawText;
    private Instant uploadedAt = Instant.now();

    public Resume() {}

    public Resume(String id, String userId, String fileName, String contentType, long fileSize, String rawText, Instant uploadedAt) {
        this.id = id;
        this.userId = userId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.rawText = rawText;
        this.uploadedAt = uploadedAt;
    }

    public static ResumeBuilder builder() {
        return new ResumeBuilder();
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public static class ResumeBuilder {
        private String id;
        private String userId;
        private String fileName;
        private String contentType;
        private long fileSize;
        private String rawText;
        private Instant uploadedAt = Instant.now();

        ResumeBuilder() {}

        public ResumeBuilder id(String id) {
            this.id = id;
            return this;
        }

        public ResumeBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public ResumeBuilder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public ResumeBuilder contentType(String contentType) {
            this.contentType = contentType;
            return this;
        }

        public ResumeBuilder fileSize(long fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public ResumeBuilder rawText(String rawText) {
            this.rawText = rawText;
            return this;
        }

        public ResumeBuilder uploadedAt(Instant uploadedAt) {
            this.uploadedAt = uploadedAt;
            return this;
        }

        public Resume build() {
            return new Resume(id, userId, fileName, contentType, fileSize, rawText, uploadedAt);
        }
    }
}
