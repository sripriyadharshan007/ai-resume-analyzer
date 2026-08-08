package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.CustomResume;
import com.resumeanalyzer.repository.CustomResumeRepository;
import com.resumeanalyzer.security.UserPrincipal;
import com.resumeanalyzer.service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes/builder")
public class CustomResumeController {

    private final CustomResumeRepository customResumeRepository;
    private final AiService aiService;

    public CustomResumeController(CustomResumeRepository customResumeRepository, AiService aiService) {
        this.customResumeRepository = customResumeRepository;
        this.aiService = aiService;
    }

    @PostMapping("/enhance")
    public ResponseEntity<?> enhanceText(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        String text = request.get("text");
        String context = request.getOrDefault("context", "General Resume Bullet Point");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Text content is required"));
        }
        String enhancedText = aiService.enhanceResumeText(text, context);
        return ResponseEntity.ok(Map.of("enhancedText", enhancedText));
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveResume(
            @RequestBody CustomResume customResume,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }

        customResume.setUserId(userPrincipal.getId());

        if (customResume.getId() != null && !customResume.getId().trim().isEmpty()) {
            // Updating existing resume
            return customResumeRepository.findById(customResume.getId())
                    .map(existing -> {
                        if (!existing.getUserId().equals(userPrincipal.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                        }
                        customResume.setVersion(existing.getVersion() + 1);
                        customResume.setCreatedAt(existing.getCreatedAt());
                        customResume.setUpdatedAt(Instant.now());
                        CustomResume saved = customResumeRepository.save(customResume);
                        return ResponseEntity.ok(saved);
                    })
                    .orElseGet(() -> {
                        customResume.setVersion(1);
                        customResume.setCreatedAt(Instant.now());
                        customResume.setUpdatedAt(Instant.now());
                        CustomResume saved = customResumeRepository.save(customResume);
                        return ResponseEntity.ok(saved);
                    });
        } else {
            // New resume
            customResume.setVersion(1);
            customResume.setCreatedAt(Instant.now());
            customResume.setUpdatedAt(Instant.now());
            CustomResume saved = customResumeRepository.save(customResume);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> listResumes(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        List<CustomResume> resumes = customResumeRepository.findByUserIdOrderByUpdatedAtDesc(userPrincipal.getId());
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResume(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        return customResumeRepository.findById(id)
                .map(resume -> {
                    if (!resume.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                    }
                    return ResponseEntity.ok(resume);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        return customResumeRepository.findById(id)
                .map(resume -> {
                    if (!resume.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                    }
                    customResumeRepository.delete(resume);
                    return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
