package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.CourseRecommendationResponse;
import com.resumeanalyzer.model.Analysis;
import com.resumeanalyzer.repository.AnalysisRepository;
import com.resumeanalyzer.security.UserPrincipal;
import com.resumeanalyzer.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private static final Logger log = LoggerFactory.getLogger(CourseController.class);

    private final AnalysisRepository analysisRepository;
    private final AiService aiService;

    public CourseController(AnalysisRepository analysisRepository, AiService aiService) {
        this.analysisRepository = analysisRepository;
        this.aiService = aiService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(
            @RequestParam("analysisId") String analysisId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        Optional<Analysis> analysisOpt = analysisRepository.findById(analysisId);
        if (analysisOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Analysis analysis = analysisOpt.get();
        if (!analysis.getUserId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            log.info("Generating course recommendations for user: {}, analysis: {}", userPrincipal.getEmail(), analysisId);
            
            List<String> missingSkills = analysis.getMissingSkills();
            if (missingSkills == null || missingSkills.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<CourseRecommendationResponse> recommendations = aiService.generateCourseRecommendations(missingSkills);
            return ResponseEntity.ok(recommendations);

        } catch (Exception e) {
            log.error("Failed to generate course recommendations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error during course recommendations: " + e.getMessage()));
        }
    }
}
