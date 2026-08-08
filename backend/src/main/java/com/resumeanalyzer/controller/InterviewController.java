package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.Analysis;
import com.resumeanalyzer.model.InterviewSession;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.repository.AnalysisRepository;
import com.resumeanalyzer.repository.InterviewRepository;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.security.UserPrincipal;
import com.resumeanalyzer.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private static final Logger log = LoggerFactory.getLogger(InterviewController.class);

    private final InterviewRepository interviewRepository;
    private final AnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;

    public InterviewController(InterviewRepository interviewRepository, AnalysisRepository analysisRepository,
                               ResumeRepository resumeRepository, AiService aiService) {
        this.interviewRepository = interviewRepository;
        this.analysisRepository = analysisRepository;
        this.resumeRepository = resumeRepository;
        this.aiService = aiService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startInterview(
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        String analysisId = requestBody.get("analysisId");
        if (analysisId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "analysisId is required"));
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

        Optional<Resume> resumeOpt = resumeRepository.findById(analysis.getResumeId());
        if (resumeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Resume file details not found"));
        }

        try {
            log.info("Starting mock interview for user: {}, profile: {}", userPrincipal.getEmail(), analysis.getTargetJobTitle());
            
            // 1. Generate role-targeted questions based on parsed resume text
            List<InterviewSession.Question> questions = aiService.generateInterviewQuestions(
                    resumeOpt.get().getRawText(), 
                    analysis.getTargetJobTitle()
            );

            // 2. Create session logs
            InterviewSession session = InterviewSession.builder()
                    .userId(userPrincipal.getId())
                    .resumeId(analysis.getResumeId())
                    .targetJobTitle(analysis.getTargetJobTitle())
                    .questions(questions)
                    .status("IN_PROGRESS")
                    .createdAt(Instant.now())
                    .build();

            interviewRepository.save(session);

            return ResponseEntity.status(HttpStatus.CREATED).body(session);

        } catch (Exception e) {
            log.error("Failed to generate mock interview session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to start interview: " + e.getMessage()));
        }
    }

    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<?> submitAnswer(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        String questionId = requestBody.get("questionId");
        String userAnswerText = requestBody.get("userAnswerText");

        if (questionId == null || userAnswerText == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "questionId and userAnswerText are required"));
        }

        Optional<InterviewSession> sessionOpt = interviewRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        InterviewSession session = sessionOpt.get();
        if (!session.getUserId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        if ("COMPLETED".equals(session.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Interview session is already completed"));
        }

        // Locate the target question
        Optional<InterviewSession.Question> questionOpt = session.getQuestions().stream()
                .filter(q -> q.getQuestionId().equals(questionId))
                .findFirst();

        if (questionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Question not found in this session"));
        }

        try {
            log.info("Evaluating answer for session {}, question {}", sessionId, questionId);
            
            // Call AI grading service
            InterviewSession.Answer answer = aiService.evaluateInterviewAnswer(
                    questionOpt.get().getQuestionText(), 
                    userAnswerText
            );
            answer.setQuestionId(questionId);
            answer.setUserAnswerText(userAnswerText);

            // Add graded answer to history lists
            session.getAnswers().add(answer);

            // If all questions are answered, transition status to COMPLETED
            if (session.getAnswers().size() >= session.getQuestions().size()) {
                session.setStatus("COMPLETED");
                session.setCompletedAt(Instant.now());
            }

            interviewRepository.save(session);
            return ResponseEntity.ok(answer);

        } catch (Exception e) {
            log.error("Failed to grade mock answer", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error during grading: " + e.getMessage()));
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getSessionDetails(
            @PathVariable String sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        return interviewRepository.findById(sessionId)
                .map(session -> {
                    if (!session.getUserId().equals(userPrincipal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "Access denied"));
                    }
                    return ResponseEntity.ok(session);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/list")
    public ResponseEntity<?> listSessions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }
        List<InterviewSession> sessions = interviewRepository.findByUserId(userPrincipal.getId());
        return ResponseEntity.ok(sessions);
    }
}

