package com.pranav_khode.InterviewAce.ai_interview.mongodb;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

import com.pranav_khode.InterviewAce.ai_interview.InterviewFeedback;
import com.pranav_khode.InterviewAce.dto.Content;

import jakarta.persistence.Id;

@Document(collection = "interview_history")
public class InterviewHistory {

    @Id
    private String id;

    private String userId;
    private List<Content> history;
    private InterviewFeedback feedback;

    public InterviewHistory(String userId, List<Content> history, InterviewFeedback feedback) {
        this.userId = userId;
        this.history = history;
        this.feedback = feedback;
    }

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public List<Content> getHistory() {
		return history;
	}

	public void setHistory(List<Content> history) {
		this.history = history;
	}

	public InterviewFeedback getFeedback() {
		return feedback;
	}

	public void setFeedback(InterviewFeedback feedback) {
		this.feedback = feedback;
	}

    
}
