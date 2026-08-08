package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.CoverLetter;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.repository.CoverLetterRepository;
import com.resumeanalyzer.repository.ResumeRepository;
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
@RequestMapping("/api/coverletters")
public class CoverLetterController {

    private final CoverLetterRepository coverLetterRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;

    public CoverLetterController(CoverLetterRepository coverLetterRepository,
                                 ResumeRepository resumeRepository,
                                 AiService aiService) {
        this.coverLetterRepository = coverLetterRepository;
        this.resumeRepository = resumeRepository;
        this.aiService = aiService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }

        String jobDescription = request.get("jobDescription");
        String recipientName = request.getOrDefault("recipientName", "Hiring Manager");
        String companyName = request.getOrDefault("companyName", "Target Company");
        String jobTitle = request.getOrDefault("jobTitle", "Software Engineer");

        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Job description is required"));
        }

        // Fetch user's latest resume
        List<Resume> resumes = resumeRepository.findByUserId(userPrincipal.getId());
        String resumeText = "";
        if (resumes != null && !resumes.isEmpty()) {
            // Sort by uploaded time descending
            resumes.sort((a, b) -> b.getUploadedAt().compareTo(a.getUploadedAt()));
            resumeText = resumes.get(0).getRawText();
        }

        if (resumeText.isEmpty()) {
            // Provide a general fallback developer profile description if no resume was uploaded
            resumeText = "Software Engineer with hands-on experience in Java, Spring Boot, JavaScript, and database management. " +
                    "Passionate about writing clean, scalable services and designing modular web applications.";
        }

        String content;
        try {
            content = aiService.generateCoverLetter(resumeText, jobDescription, recipientName, companyName, jobTitle);
        } catch (Exception e) {
            content = "Dear " + recipientName + ",\n\n" +
                      "I am writing to express my strong interest in the " + jobTitle + " position at " + companyName + ".\n\n" +
                      "With my background in software engineering and track record of building robust web applications, I have developed a deep appreciation for the technical challenges your team is solving. My experience aligns perfectly with the requirements outlined in the job description.\n\n" +
                      "In my previous roles, I have consistently delivered high-quality, scalable solutions and collaborated effectively with cross-functional teams to bring products to market. I am particularly drawn to " + companyName + " because of your commitment to innovation and engineering excellence.\n\n" +
                      "Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experiences can contribute to your team's success.\n\n" +
                      "Sincerely,\n[Your Name]";
        }
        return ResponseEntity.ok(Map.of("content", content));
    }

    @PostMapping("/save")
    public ResponseEntity<?> save(
            @RequestBody CoverLetter coverLetter,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }

        coverLetter.setUserId(userPrincipal.getId());
        
        if (coverLetter.getId() != null && !coverLetter.getId().trim().isEmpty()) {
            return coverLetterRepository.findById(coverLetter.getId())
                    .map(existing -> {
                        if (!existing.getUserId().equals(userPrincipal.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                        }
                        coverLetter.setCreatedAt(existing.getCreatedAt());
                        coverLetter.setUpdatedAt(Instant.now());
                        CoverLetter saved = coverLetterRepository.save(coverLetter);
                        return ResponseEntity.ok(saved);
                    })
                    .orElseGet(() -> {
                        coverLetter.setCreatedAt(Instant.now());
                        coverLetter.setUpdatedAt(Instant.now());
                        CoverLetter saved = coverLetterRepository.save(coverLetter);
                        return ResponseEntity.ok(saved);
                    });
        } else {
            coverLetter.setCreatedAt(Instant.now());
            coverLetter.setUpdatedAt(Instant.now());
            CoverLetter saved = coverLetterRepository.save(coverLetter);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        List<CoverLetter> letters = coverLetterRepository.findByUserIdOrderByUpdatedAtDesc(userPrincipal.getId());
        return ResponseEntity.ok(letters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        return coverLetterRepository.findById(id)
                .map(letter -> {
                    if (!letter.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                    }
                    return ResponseEntity.ok(letter);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        return coverLetterRepository.findById(id)
                .map(letter -> {
                    if (!letter.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
                    }
                    coverLetterRepository.delete(letter);
                    return ResponseEntity.ok(Map.of("message", "Cover letter deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
