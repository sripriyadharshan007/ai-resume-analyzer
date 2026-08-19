package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.TrainingResume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingResumeRepository extends MongoRepository<TrainingResume, String> {
}
