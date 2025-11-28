package com.pranav_khode.InterviewAce.ai_interview;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pranav_khode.InterviewAce.dto.Content;
import com.pranav_khode.InterviewAce.dto.GeminiRequest;
import com.pranav_khode.InterviewAce.dto.GeminiResponse;
import com.pranav_khode.InterviewAce.dto.Part;

import reactor.core.publisher.Mono;

@Service
public class InterviewService {
	
	@Value("${gemini.api.url}")
	private String geminiApiUrl;
	
	@Value("${gemini.api.key}")
	private String geminiApiKey;
	
	
	private final WebClient webClient;

	public InterviewService(WebClient.Builder webClient) {
		this.webClient = webClient.build();
	}

    /**
     * Phase 1: Initializes the conversation history with the resume and system instruction.
     * @param resumeText The user's resume content.
     * @return The initial history list containing the setup prompt.
     */
	public List<Content> startInterview(String resumeText, String jobDescriptionText, String difficultyLevel, String interviewType) {
	    List<Content> history = new ArrayList<>();

	    String initialPrompt =
	            "You are an AI Interviewer specialized in conducting " + interviewType + " interviews. " +
	            "Use ONLY the following:\n" +
	            "1. Resume: " + resumeText + "\n" +
	            "2. Job Description: " + jobDescriptionText + "\n" +
	            "Select difficulty level: " + difficultyLevel + "\n\n" +
	            "Instructions:\n" +
	            "1. Ask questions strictly relevant to the resume & job description.\n" +
	            "2. Maintain professionalism.\n" +
	            "3. For each user response, give a short constructive suggestion.\n" +
	            "4. Then ask the next question.\n" +
	            "5. When user says 'End Interview', provide a final detailed feedback report.";

	    List<Part> parts = new ArrayList<>();
	    parts.add(new Part(initialPrompt));

	    Content content = new Content("user", parts);
	    history.add(content);

	    return history;
	}


    /**
     * Phase 2: Runs one turn of the interview.
     * @param history The ongoing conversation history (Q/A turns).
     * @param latestUserPrompt The new user input (answer or command).
     * @return A Mono that emits the model's response text.
     */
    public Mono<String> getNextResponse(List<Content> history, String latestUserPrompt) {

        List<Part> userParts = new ArrayList<>();
        userParts.add(new Part(latestUserPrompt));

        // Append the new user prompt to the history
        history.add(new Content("user", userParts));

        // Build the final request body containing the full history
        GeminiRequest requestBody = new GeminiRequest(history);

        return webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .flatMap(response -> {
                    // Extract model's text response
                    String modelResponseText = response.candidates().stream()
                            .findFirst()
                            .map(c -> c.content().parts().get(0).text())
                            .orElse("No valid response from model.");

                    // Add model response back into history for next turn
                    history.add(new Content(
                            "model",
                            List.of(new Part(modelResponseText))
                    ));

                    return Mono.just(modelResponseText);
                })
                .onErrorResume(e -> {
                    System.err.println("Gemini API error: " + e.getMessage());
                    return Mono.just("An error occurred during the API call: " + e.getMessage());
                });
    }
    
    public Mono<InterviewFeedback> getFinalFeedback(List<Content> history) {

        String finalPrompt = """
                You are an AI interviewer evaluation assistant.

                Your task is to generate a structured, JSON-formatted interview feedback report based on the entire conversation history between the interviewer and the candidate.
                
                Return **only a valid JSON object** — no markdown formatting, no code blocks, no backticks, and no explanations. 
                The response must start with '{' and end with '}'.
                
                JSON Structure (Example):
                {
                  "overallPerformance": {
                    "rating": 4.2,
                    "summary": "The candidate demonstrated solid full-stack skills, especially in backend optimization and database handling."
                  },
                  "strengths": [
                    "Good understanding of React.js and Spring Boot integration.",
                    "Strong problem-solving and debugging approach."
                  ],
                  "weaknesses": [
                    "Needs to provide measurable results for performance improvements.",
                    "Should elaborate more on authentication and security implementation details."
                  ],
                  "communication": {
                    "clarity": "Good – communicates technical ideas effectively.",
                    "structure": "Moderate – could organize responses better using the STAR method.",
                    "conciseness": "Strong – answers are brief and relevant.",
                    "impactFocus": "Needs improvement – should highlight project impact and metrics."
                  },
                  "areasForImprovement": [
                    "Use more quantifiable metrics in explanations.",
                    "Improve depth in security and API optimization discussions."
                  ],
                  "recommendations": [
                    "Practice explaining technical concepts using the STAR method.",
                    "Explore DevOps and cloud fundamentals (Docker, AWS)."
                  ],
                  "evaluationMetrics": {
                    "technicalKnowledge": 8,
                    "problemSolving": 7,
                    "communication": 8,
                    "projectExperience": 8,
                    "overallReadiness": 7.8
                  },
                  "interviewerNotes": [
                    {
                      "section": "Full-Stack Development",
                      "comment": "Good command over React.js and Spring Boot."
                    }
                  ],
                  "finalVerdict": {
                    "status": "Potential Candidate",
                    "summary": "Solid foundation with strong technical breadth. Can improve by adding quantifiable outcomes."
                  }
                }

                Now, analyze the entire interview conversation history and fill in this JSON structure accurately.
                """;

        List<Part> userParts = new ArrayList<>();
        userParts.add(new Part(finalPrompt));
        history.add(new Content("user", userParts));

        GeminiRequest requestBody = new GeminiRequest(history);

        return webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .flatMap(response -> {
                    // Extract text response from Gemini
                    String modelResponseText = response.candidates().stream()
                            .findFirst()
                            .map(c -> c.content().parts().get(0).text())
                            .orElse("{}");

                    // Log raw response (optional for debugging)
                    System.out.println("Raw Gemini Response:\n" + modelResponseText);

                    // 🧹 Clean up extra formatting
                    modelResponseText = modelResponseText
                            .trim()
                            .replaceAll("^```(json)?", "")
                            .replaceAll("```$", "")
                            .replaceAll("(?s)^.*?(\\{.*\\})", "$1"); // Extract only JSON object

                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        InterviewFeedback feedback = mapper.readValue(modelResponseText, InterviewFeedback.class);

                        // Add model’s response back into history
                        history.add(new Content("model", List.of(new Part(mapper.writeValueAsString(feedback)))));

                        return Mono.just(feedback);

                    } catch (Exception e) {
                        System.err.println("Error parsing structured feedback JSON: " + e.getMessage());
                        System.err.println("Cleaned response: " + modelResponseText);
                        return Mono.error(new RuntimeException("Invalid response format from model."));
                    }
                })
                .onErrorResume(e -> {
                    System.err.println("Gemini API error: " + e.getMessage());
                    return Mono.error(new RuntimeException("An error occurred during the API call: " + e.getMessage()));
                });
    }


}
