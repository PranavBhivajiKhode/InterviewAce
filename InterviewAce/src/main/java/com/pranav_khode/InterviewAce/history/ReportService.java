package com.pranav_khode.InterviewAce.history;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    @Autowired
    private InterviewReportRepository repo;

    public InterviewReport saveReport(InterviewReport report) {
        return repo.save(report);
    }
}
