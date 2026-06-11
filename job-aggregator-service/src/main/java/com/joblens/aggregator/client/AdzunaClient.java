package com.joblens.aggregator.client;

import com.joblens.aggregator.config.AdzunaProperties;
import com.joblens.aggregator.dto.AdzunaJobResult;
import com.joblens.aggregator.dto.AdzunaResponse;
import com.joblens.aggregator.model.Job;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Component
@Slf4j
public class AdzunaClient {

    private final RestClient restClient;
    private final AdzunaProperties props;

    public AdzunaClient(RestClient.Builder builder, AdzunaProperties props) {
        this.props = props;
        // No baseUrl — URIs are constructed explicitly in buildUri() for full control
        this.restClient = builder.build();
    }

    @CircuitBreaker(name = "adzuna", fallbackMethod = "fetchJobsFallback")
    @Retry(name = "adzuna")
    public List<Job> fetchJobs(String what, String where, int page) {
        URI requestUri = buildUri(what, where, page);

        // Log the full URI before the call, masking the secret key
        log.info("Requesting Adzuna: {}",
                requestUri.toString().replaceAll("(app_key=)[^&]+", "$1****"));

        AdzunaResponse response = restClient.get()
                .uri(requestUri)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(AdzunaResponse.class);

        if (response == null || response.results() == null) {
            return List.of();
        }

        log.info("Adzuna returned {} results (total available: {})", response.results().size(), response.count());
        return response.results().stream().map(this::toJob).toList();
    }

    /**
     * Builds the request URI exactly as: {base-url}/{page}?app_id=...&app_key=...&what=...&where=...
     *
     * pathSegment() appends /{page} safely regardless of whether base-url has a trailing slash.
     * .encode() does a single percent-encoding pass — spaces become %20, never %2520.
     */
    private URI buildUri(String what, String where, int page) {
        String baseUrl = props.getBaseUrl().stripTrailing().replaceAll("/+$", "");
        return UriComponentsBuilder
                .fromHttpUrl(baseUrl)
                .pathSegment(String.valueOf(page))
                .queryParam("app_id", props.getAppId())
                .queryParam("app_key", props.getAppKey())
                .queryParam("results_per_page", 50)
                .queryParam("what", what)
                .queryParam("where", where)
                .encode()
                .build()
                .toUri();
    }

    // Package-private so Resilience4j AOP can reflectively invoke it
    List<Job> fetchJobsFallback(String what, String where, int page, Throwable ex) {
        log.warn("Adzuna API unavailable — circuit open or retries exhausted (what='{}', where='{}', page={}): {}",
                what, where, page, ex.getMessage());
        return List.of();
    }

    private Job toJob(AdzunaJobResult r) {
        return Job.builder()
                .externalId(r.id())
                .title(r.title())
                .description(r.description())
                .applyUrl(r.redirectUrl())
                .source("Adzuna")
                .company(r.company() != null ? r.company().displayName() : null)
                .location(r.location() != null ? r.location().displayName() : null)
                .salaryMin(r.salaryMin())
                .salaryMax(r.salaryMax())
                .postedDate(parseDate(r.created()))
                .build();
    }

    private LocalDateTime parseDate(String created) {
        if (created == null) return null;
        try {
            return OffsetDateTime.parse(created).toLocalDateTime();
        } catch (Exception e) {
            log.debug("Could not parse Adzuna date '{}': {}", created, e.getMessage());
            return null;
        }
    }
}
