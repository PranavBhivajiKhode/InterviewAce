package com.pranav_khode.InterviewAce;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

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
}
