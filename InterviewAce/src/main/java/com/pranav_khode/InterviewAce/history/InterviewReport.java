package com.pranav_khode.InterviewAce.history;

import java.util.Date;
import java.util.Map;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.Id;

@Document(collection = "interview_reports")
public class InterviewReport {

    @Id
    private String id;

    private String userId;              // From JWT token
    private String videoFileId;         // GridFS file ID
    private String videoUrl;            // /videos/{id}
    private Map<String, Object> analysisData; 
    private int overallScore;
    private Date createdAt = new Date();
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
	public String getVideoFileId() {
		return videoFileId;
	}
	public void setVideoFileId(String videoFileId) {
		this.videoFileId = videoFileId;
	}
	public String getVideoUrl() {
		return videoUrl;
	}
	public void setVideoUrl(String videoUrl) {
		this.videoUrl = videoUrl;
	}
	public Map<String, Object> getAnalysisData() {
		return analysisData;
	}
	public void setAnalysisData(Map<String, Object> analysisData) {
		this.analysisData = analysisData;
	}
	public int getOverallScore() {
		return overallScore;
	}
	public void setOverallScore(int overallScore) {
		this.overallScore = overallScore;
	}
	public Date getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

    
    
}

