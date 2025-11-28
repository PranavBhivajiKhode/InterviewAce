package com.pranav_khode.InterviewAce;


import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;

import com.pranav_khode.InterviewAce.dto.Content;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = "http://localhost:3000, http://localhost:5173", allowCredentials = "true"
        ,exposedHeaders = "X-Session-Id"
)
public class InterviewController {

    private final InterviewService interviewService;
    private final PDFExtraction pdfExtraction;
    private static final String HISTORY_KEY = "CONVERSATION_HISTORY";
    
    public InterviewController(InterviewService interviewService, PDFExtraction pdfExtraction) {
    	this.interviewService = interviewService;
    	this.pdfExtraction = pdfExtraction;
    }

//    private record UserInput(String text) {}

    @PostMapping("/start")
    public Mono<ResponseEntity<String>> startInterview(
            @RequestPart("resume") FilePart resumeFile,  // ✅ Required
            @RequestPart(value = "jobDescription", required = false) FilePart jobDescriptionFile, // ✅ Optional
            @RequestPart(value = "difficultyLevel", required = false) String difficultyLevel, // ✅ Optional
            @RequestPart(value = "interviewType", required = false) String interviewType, // ✅ Optional
            WebSession session) {

        // ✅ Apply defaults if missing
        String finalDifficulty = (difficultyLevel == null || difficultyLevel.isBlank()) ? "Medium" : difficultyLevel;
        String finalInterviewType = (interviewType == null || interviewType.isBlank()) ? "Technical" : interviewType;

        // ✅ Save resume file (always required)
        Mono<File> resumeMono = saveTempFile(resumeFile);

        // ✅ Save job description only if present
        Mono<File> jdMono = (jobDescriptionFile != null)
                ? saveTempFile(jobDescriptionFile)
                : Mono.justOrEmpty((File) null);

        return Mono.zip(resumeMono, jdMono)
                .flatMap(tuple -> {
                    File resumeTemp = tuple.getT1();
                    File jdTemp = tuple.getT2();

                    String resumeText = "";
                    String jdText = "";

                    try {
                        // ✅ Extract resume text (always)
                        if (resumeFile.filename().toLowerCase().endsWith(".pdf")) {
                            resumeText = pdfExtraction.extractText(resumeTemp);
                        }

                        // ✅ Extract JD text if provided
                        if (jdTemp != null && jobDescriptionFile.filename().toLowerCase().endsWith(".pdf")) {
                            jdText = pdfExtraction.extractText(jdTemp);
                        }
                    } catch (IOException e) {
                        return Mono.error(new RuntimeException("Error extracting text from PDF", e));
                    }

                    // ✅ Start interview with all combined data
                    List<Content> history = interviewService.startInterview(
                            resumeText, jdText, finalDifficulty, finalInterviewType
                    );
                    session.getAttributes().put(HISTORY_KEY, history);

                    // ✅ First question request
                    return interviewService.getNextResponse(history, "Generate the first interview question.")
                            .map(question -> ResponseEntity.ok()
                                    .header("X-Session-Id", session.getId())
                                    .body("Interview Started. " + question));
                });
    }

    private Mono<File> saveTempFile(FilePart file) {
        return Mono.fromCallable(() -> File.createTempFile("upload", null))
                .flatMap(tempFile -> file.transferTo(tempFile).thenReturn(tempFile));
    }



    @PostMapping("/turn")
    public Mono<String> nextTurn(@RequestBody String input, WebSession session) {
        List<Content> history = (List<Content>) session.getAttributes().get(HISTORY_KEY);

        if (history == null) {
            return Mono.just("Error: Interview session not found. Please start a new interview.");
        }

        // 2. Process the turn (user answer)
        return interviewService.getNextResponse(
            history, 
            input
        );
    }
    

    @GetMapping("/end")
    private Mono<InterviewFeedback> getFinalFeedback(WebSession session) {
        List<Content> history = (List<Content>) session.getAttributes().get(HISTORY_KEY);

        if (history == null) {
            return Mono.error(new IllegalStateException("No conversation history found."));
        }

        // Call the helper method to get structured feedback object
        return interviewService.getFinalFeedback(history)
                .doOnSuccess(response -> session.getAttributes().remove(HISTORY_KEY))
                .onErrorResume(e -> {
                    System.err.println("Error fetching final feedback: " + e.getMessage());
                    return Mono.error(new RuntimeException("Failed to generate interview feedback."));
                });
    }

}