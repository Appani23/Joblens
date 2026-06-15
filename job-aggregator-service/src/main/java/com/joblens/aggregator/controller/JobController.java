package com.joblens.aggregator.controller;

import com.joblens.aggregator.dto.IngestionSummary;
import com.joblens.aggregator.model.Job;
import com.joblens.aggregator.repository.JobEntityRepository;
import com.joblens.aggregator.service.JobIngestionService;
import com.joblens.aggregator.specification.JobSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

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
    public Page<Job> getAllJobs(
            @RequestParam(required = false) String what,
            @RequestParam(required = false) String where,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Integer datePostedDays,
            @RequestParam(required = false) String jobLevel,
            @RequestParam(required = false) String workMode,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Specification<Job> spec = JobSpecification.withFilters(
                what, where, company, datePostedDays, jobLevel, workMode);
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        return jobEntityRepository.findAll(spec, pageable);
    }

    private Sort resolveSort(String sort) {
        return Sort.by(
                Sort.Order.desc("postedDate"),
                Sort.Order.desc("id")
        );
    }
}
