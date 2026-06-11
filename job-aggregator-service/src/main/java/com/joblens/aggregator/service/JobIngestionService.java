package com.joblens.aggregator.service;

import com.joblens.aggregator.client.AdzunaClient;
import com.joblens.aggregator.dto.IngestionSummary;
import com.joblens.aggregator.model.Job;
import com.joblens.aggregator.repository.JobEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobIngestionService {

    private final AdzunaClient adzunaClient;
    private final JobEntityRepository jobEntityRepository;

    @Transactional
    public IngestionSummary ingest(String what, String where) {
        List<Job> fetched = adzunaClient.fetchJobs(what, where, 1);

        int saved = 0;
        int duplicates = 0;

        for (Job job : fetched) {
            if (jobEntityRepository.existsByExternalId(job.getExternalId())) {
                duplicates++;
            } else {
                jobEntityRepository.save(job);
                saved++;
            }
        }

        log.info("Ingestion complete — fetched: {}, saved: {}, duplicates: {}", fetched.size(), saved, duplicates);
        return new IngestionSummary(fetched.size(), saved, duplicates);
    }
}
