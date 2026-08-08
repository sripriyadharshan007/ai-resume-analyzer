package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.Analysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRepository extends MongoRepository<Analysis, String> {
    List<Analysis> findByUserId(String userId);
    List<Analysis> findByUserIdOrderByAnalyzedAtDesc(String userId);
}
