package com.resumeanalyzer.dto;

import java.util.List;

public class CourseRecommendationResponse {
    private String skill;
    private List<Course> courses;

    public CourseRecommendationResponse() {}

    public CourseRecommendationResponse(String skill, List<Course> courses) {
        this.skill = skill;
        this.courses = courses;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }

    public static class Course {
        private String title;
        private String provider;
        private String url;
        private String difficulty;

        public Course() {}

        public Course(String title, String provider, String url, String difficulty) {
            this.title = title;
            this.provider = provider;
            this.url = url;
            this.difficulty = difficulty;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }
    }
}
