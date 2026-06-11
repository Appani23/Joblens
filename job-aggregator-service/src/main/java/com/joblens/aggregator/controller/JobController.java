package com.joblens.aggregator.controller;

import com.joblens.aggregator.dto.IngestionSummary;
import com.joblens.aggregator.model.Job;
import com.joblens.aggregator.repository.JobEntityRepository;
import com.joblens.aggregator.service.JobIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobIngestionService jobIngestionService;
    private final JobEntityRepository jobEntityRepository;

    @PostMapping("/fetch")
    public IngestionSummary fetchJobs(
            @RequestParam(defaultValue = "java developer") String what,
            @RequestParam(defaultValue = "remote") String where) {
        return jobIngestionService.ingest(what, where);
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return jobEntityRepository.findAll();
    }
}
