package com.pranav_khode.InterviewAce.ai_interview.mongodb;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewHistoryRepository 
        extends MongoRepository<InterviewHistory, String> {
}
