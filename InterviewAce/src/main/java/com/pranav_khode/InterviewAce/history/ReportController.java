package com.pranav_khode.InterviewAce.history;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/interview-video/report")
public class ReportController {

    @Autowired
    private VideoStorageService videoStorageService;

    @Autowired
    private ReportService reportService;

    @PostMapping(value = "/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveReport(
            @RequestPart("video") MultipartFile video,
            @RequestPart("analysis") String analysisJson,
            @RequestHeader("userId") String userId 
    ) throws Exception {

        // Save video in GridFS
        String fileId = videoStorageService.saveVideo(video);
        String videoUrl = "/api/videos/" + fileId;

        // Convert analysis JSON → Map
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> analysisMap = mapper.readValue(analysisJson, Map.class);

        // Compute score (or receive from frontend)
        int score = (int) analysisMap.getOrDefault("overallScore", 0);

        InterviewReport report = new InterviewReport();
        report.setUserId(userId);
        report.setVideoFileId(fileId);
        report.setVideoUrl(videoUrl);
        report.setAnalysisData(analysisMap);
        report.setOverallScore(score);

        return ResponseEntity.ok(reportService.saveReport(report));
    }
    
    @GetMapping("/api/videos/{id}")
    public ResponseEntity<?> getVideo(@PathVariable String id) throws IOException {
        GridFsResource video = videoStorageService.getVideo(id);

        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("video/mp4"))
                .body(video.getInputStream().readAllBytes());
    }
}

