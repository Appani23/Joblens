package com.joblens.aggregator.scheduler;

import com.joblens.aggregator.config.FetchProperties;
import com.joblens.aggregator.dto.IngestionSummary;
import com.joblens.aggregator.service.JobIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobFetchScheduler {

    private final JobIngestionService jobIngestionService;
    private final FetchProperties fetchProperties;

    /**
     * Runs every `joblens.fetch.interval-ms` milliseconds (default 6 h).
     * Initial delay of 1 minute prevents a burst on every restart.
     * The interval string supports the :default syntax so the service starts
     * even if the property is absent from the environment.
     */
    @Scheduled(
            fixedRateString    = "${joblens.fetch.interval-ms:21600000}",
            initialDelayString = "${joblens.fetch.initial-delay-ms:60000}"
    )
    public void fetchAll() {
        List<FetchProperties.QueryConfig> queries = fetchProperties.getQueries();

        if (queries.isEmpty()) {
            log.warn("Scheduled fetch skipped — no queries configured under joblens.fetch.queries");
            return;
        }

        log.info("=== Scheduled fetch starting ({} quer{}) ===",
                queries.size(), queries.size() == 1 ? "y" : "ies");

        int totalFetched = 0, totalSaved = 0, totalDuplicates = 0;

        for (FetchProperties.QueryConfig q : queries) {
            try {
                IngestionSummary s = jobIngestionService.ingest(q.getWhat(), q.getWhere());
                totalFetched    += s.fetched();
                totalSaved      += s.saved();
                totalDuplicates += s.duplicates();
                log.info("  [{}] in [{}] → fetched={}, saved={}, duplicates={}",
                        q.getWhat(), q.getWhere(), s.fetched(), s.saved(), s.duplicates());
            } catch (Exception e) {
                log.error("  [{}] in [{}] failed: {}", q.getWhat(), q.getWhere(), e.getMessage(), e);
            }
        }

        log.info("=== Scheduled fetch complete — fetched={}, saved={}, duplicates={} ===",
                totalFetched, totalSaved, totalDuplicates);
    }
}
