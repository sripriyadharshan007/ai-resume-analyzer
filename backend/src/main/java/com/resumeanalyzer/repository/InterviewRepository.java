package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.InterviewSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends MongoRepository<InterviewSession, String> {
    List<InterviewSession> findByUserId(String userId);
}
