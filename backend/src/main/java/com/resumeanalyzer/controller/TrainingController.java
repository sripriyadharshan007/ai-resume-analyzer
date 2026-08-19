package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.TrainingResume;
import com.resumeanalyzer.repository.TrainingResumeRepository;
import com.resumeanalyzer.service.ParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TrainingController {

    @Autowired
    private TrainingResumeRepository repository;

    @Autowired
    private ParserService parserService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadTrainingResume(@RequestParam("file") MultipartFile file,
                                                  @RequestParam(value = "type", defaultValue = "Standard") String type) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String extractedText = parserService.parseDocument(file);
            
            if (extractedText == null || extractedText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not extract text from file"));
            }

            TrainingResume trainingResume = new TrainingResume(file.getOriginalFilename(), extractedText);
            trainingResume.setType(type);
            repository.save(trainingResume);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Training resume uploaded successfully");
            response.put("id", trainingResume.getId());
            response.put("filename", trainingResume.getFilename());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload training resume: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TrainingResume>> getAllTrainingResumes() {
        try {
            List<TrainingResume> resumes = repository.findAll();
            // Optional: You could nullify extractedText here if you only want to send metadata to frontend
            return ResponseEntity.ok(resumes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrainingResume(@PathVariable String id) {
        try {
            if (repository.existsById(id)) {
                repository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Training resume deleted"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Resume not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete training resume: " + e.getMessage()));
        }
    }
}
