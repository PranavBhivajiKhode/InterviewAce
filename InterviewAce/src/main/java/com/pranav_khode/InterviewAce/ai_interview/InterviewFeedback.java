package com.pranav_khode.InterviewAce.ai_interview;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class InterviewFeedback {

    private OverallPerformance overallPerformance;
    private List<String> strengths;
    private List<String> weaknesses;
    private Communication communication;
    private List<String> areasForImprovement;
    private List<String> recommendations;
    private EvaluationMetrics evaluationMetrics;
    private List<InterviewerNote> interviewerNotes;
    private FinalVerdict finalVerdict;

    // --- getters & setters for each field ---

    public OverallPerformance getOverallPerformance() { return overallPerformance; }
    public void setOverallPerformance(OverallPerformance overallPerformance) { this.overallPerformance = overallPerformance; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }

    public Communication getCommunication() { return communication; }
    public void setCommunication(Communication communication) { this.communication = communication; }

    public List<String> getAreasForImprovement() { return areasForImprovement; }
    public void setAreasForImprovement(List<String> areasForImprovement) { this.areasForImprovement = areasForImprovement; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public EvaluationMetrics getEvaluationMetrics() { return evaluationMetrics; }
    public void setEvaluationMetrics(EvaluationMetrics evaluationMetrics) { this.evaluationMetrics = evaluationMetrics; }

    public List<InterviewerNote> getInterviewerNotes() { return interviewerNotes; }
    public void setInterviewerNotes(List<InterviewerNote> interviewerNotes) { this.interviewerNotes = interviewerNotes; }

    public FinalVerdict getFinalVerdict() { return finalVerdict; }
    public void setFinalVerdict(FinalVerdict finalVerdict) { this.finalVerdict = finalVerdict; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OverallPerformance {
        private float rating;
        private String summary;
        
        public float getRating() { return rating; }
        public void setRating(float rating) { this.rating = rating; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Communication {
        private String clarity;
        private String structure;
        private String conciseness;
        private String impactFocus;
        // getters and setters
		public String getClarity() {
			return clarity;
		}
		public void setClarity(String clarity) {
			this.clarity = clarity;
		}
		public String getStructure() {
			return structure;
		}
		public void setStructure(String structure) {
			this.structure = structure;
		}
		public String getConciseness() {
			return conciseness;
		}
		public void setConciseness(String conciseness) {
			this.conciseness = conciseness;
		}
		public String getImpactFocus() {
			return impactFocus;
		}
		public void setImpactFocus(String impactFocus) {
			this.impactFocus = impactFocus;
		}
        
        
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EvaluationMetrics {
        private int technicalKnowledge;
        private int problemSolving;
        private int communication;
        private int projectExperience;
        private float overallReadiness;
        // getters and setters
		public int getTechnicalKnowledge() {
			return technicalKnowledge;
		}
		public void setTechnicalKnowledge(int technicalKnowledge) {
			this.technicalKnowledge = technicalKnowledge;
		}
		public int getProblemSolving() {
			return problemSolving;
		}
		public void setProblemSolving(int problemSolving) {
			this.problemSolving = problemSolving;
		}
		public int getCommunication() {
			return communication;
		}
		public void setCommunication(int communication) {
			this.communication = communication;
		}
		public int getProjectExperience() {
			return projectExperience;
		}
		public void setProjectExperience(int projectExperience) {
			this.projectExperience = projectExperience;
		}
		public float getOverallReadiness() {
			return overallReadiness;
		}
		public void setOverallReadiness(float overallReadiness) {
			this.overallReadiness = overallReadiness;
		}
        
        
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class InterviewerNote {
        private String section;
        private String comment;
        // getters and setters
		public String getSection() {
			return section;
		}
		public void setSection(String section) {
			this.section = section;
		}
		public String getComment() {
			return comment;
		}
		public void setComment(String comment) {
			this.comment = comment;
		}
        
        
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FinalVerdict {
        private String status;
        private String summary;
        // getters and setters
		public String getStatus() {
			return status;
		}
		public void setStatus(String status) {
			this.status = status;
		}
		public String getSummary() {
			return summary;
		}
		public void setSummary(String summary) {
			this.summary = summary;
		}
        
        
    }
}
