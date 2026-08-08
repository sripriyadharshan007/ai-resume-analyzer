package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.JobMatch;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobMatchRepository extends MongoRepository<JobMatch, String> {
    List<JobMatch> findByUserIdOrderByMatchedAtDesc(String userId);
}
