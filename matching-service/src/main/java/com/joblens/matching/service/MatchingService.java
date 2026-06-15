package com.joblens.matching.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.joblens.matching.client.AnthropicClient;
import com.joblens.matching.dto.MatchResult;
import com.joblens.matching.dto.MatchSummary;
import com.joblens.matching.model.Job;
import com.joblens.matching.model.JobMatch;
import com.joblens.matching.model.Resume;
import com.joblens.matching.repository.JobMatchRepository;
import com.joblens.matching.repository.JobRepository;
import com.joblens.matching.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final JobMatchRepository jobMatchRepository;
    private final AnthropicClient anthropicClient;
    private final ObjectMapper objectMapper;
    private final ExecutorService scoringPool;

    /**
     * Scores every job against the user's most-recent parsed resume.
     * Deletes stale scores first so each run is idempotent — no duplicates accumulate.
     */
    public MatchSummary runForUser(String userEmail) {
        Resume resume = resumeRepository.findTopByUserEmailOrderByUploadedAtDesc(userEmail)
                .orElseThrow(() -> new IllegalStateException("No resume found — upload one first"));

        if (!resume.isParsed() || resume.getParsedJson() == null) {
            throw new IllegalStateException(
                    "Resume exists but has not been parsed yet — call POST /api/resumes/parse first");
        }

        int yearsExperience = extractYearsExperience(resume.getParsedJson());
        List<Job> jobs = jobRepository.findAll();
        log.info("=== Matching run: user={}, resume={}, jobs={} ===",
                userEmail, resume.getId(), jobs.size());

        // Delete all previous scores for this user so stale rows never accumulate
        jobMatchRepository.deleteByUserEmail(userEmail);

        long startMs = System.currentTimeMillis();
        AtomicInteger scored = new AtomicInteger(0);
        AtomicInteger skipped = new AtomicInteger(0);

        List<CompletableFuture<Void>> futures = jobs.stream()
                .filter(job -> job.getTitle() != null)
                .map(job -> CompletableFuture.runAsync(
                        () -> scoreAndSave(job, userEmail, resume.getParsedJson(),
                                yearsExperience, scored, skipped, jobs.size()),
                        scoringPool))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        long elapsedSec = (System.currentTimeMillis() - startMs) / 1000;
        int matchesAbove70 = jobMatchRepository
                .findByUserEmailAndScoreGreaterThanEqualOrderByScoreDesc(userEmail, 70)
                .size();

        log.info("=== Matching complete in {}s: scored={}, skipped={}, above70={} ===",
                elapsedSec, scored.get(), skipped.get(), matchesAbove70);
        return new MatchSummary(jobs.size(), scored.get(), matchesAbove70);
    }

    /**
     * Returns stored matches for a user at or above minScore, enriched with job details.
     * Never triggers a scoring run.
     */
    public List<MatchResult> getMatches(String userEmail, int minScore) {
        List<JobMatch> matches = jobMatchRepository
                .findByUserEmailAndScoreGreaterThanEqualOrderByScoreDesc(userEmail, minScore);

        return matches.stream().map(m -> {
            Job job = jobRepository.findById(m.getJobId()).orElse(null);
            return new MatchResult(
                    m.getJobId(),
                    m.getScore(),
                    m.getReasoning(),
                    job != null ? job.getTitle() : "(job removed)",
                    job != null ? job.getCompany() : null,
                    job != null ? job.getLocation() : null,
                    job != null ? job.getApplyUrl() : null,
                    m.getMatchedAt()
            );
        }).toList();
    }

    /** Removes all stored scores for a user (called when a new resume is uploaded). */
    public void clearMatchesForUser(String userEmail) {
        jobMatchRepository.deleteByUserEmail(userEmail);
        log.info("Cleared job matches for user={}", userEmail);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void scoreAndSave(Job job, String userEmail, String parsedJson,
                              int yearsExperience,
                              AtomicInteger scored, AtomicInteger skipped, int total) {
        try {
            String rawJson = anthropicClient.scoreJob(
                    parsedJson, job.getTitle(), job.getDescription(), yearsExperience);

            if (rawJson == null) {
                // Circuit breaker open or all retries exhausted — skip this job
                skipped.incrementAndGet();
                return;
            }

            JsonNode node = objectMapper.readTree(rawJson);
            int score = Math.min(100, Math.max(0, node.path("score").asInt(0)));
            String reasoning = node.path("reasoning").asText("No reasoning provided");

            JobMatch match = new JobMatch();
            match.setUserEmail(userEmail);
            match.setJobId(job.getId());
            match.setScore(score);
            match.setReasoning(reasoning);
            match.setMatchedAt(LocalDateTime.now());
            jobMatchRepository.save(match);

            int s = scored.incrementAndGet();
            if (s % 10 == 0) {
                log.info("  Progress: {}/{} scored, {} skipped", s, total, skipped.get());
            }
        } catch (Exception e) {
            log.warn("  Failed to score job {} ({}): {}", job.getId(), job.getTitle(), e.getMessage());
            skipped.incrementAndGet();
        }
    }

    private int extractYearsExperience(String parsedJson) {
        try {
            return objectMapper.readTree(parsedJson).path("yearsExperience").asInt(0);
        } catch (Exception e) {
            return 0;
        }
    }
}
