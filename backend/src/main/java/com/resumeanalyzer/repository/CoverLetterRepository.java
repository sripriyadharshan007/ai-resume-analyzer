package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.CoverLetter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoverLetterRepository extends MongoRepository<CoverLetter, String> {
    List<CoverLetter> findByUserIdOrderByUpdatedAtDesc(String userId);
}
