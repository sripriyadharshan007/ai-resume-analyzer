package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.CustomResume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomResumeRepository extends MongoRepository<CustomResume, String> {
    List<CustomResume> findByUserIdOrderByUpdatedAtDesc(String userId);
}
