package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.GithubAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GithubAnalysisRepository extends MongoRepository<GithubAnalysis, String> {
    List<GithubAnalysis> findByUserIdOrderByAnalyzedAtDesc(String userId);
}
