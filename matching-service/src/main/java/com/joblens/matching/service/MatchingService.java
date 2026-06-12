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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final JobMatchRepository jobMatchRepository;
    private final AnthropicClient anthropicClient;
    private final ObjectMapper objectMapper;

    /**
     * Scores every job in the DB against the user's parsed resume.
     * Upserts a JobMatch row per job (re-running updates scores rather than duplicating).
     */
    public MatchSummary runForUser(String userEmail) {
        // Load the user's most recent parsed resume
        Resume resume = resumeRepository.findTopByUserEmailOrderByUploadedAtDesc(userEmail)
                .orElseThrow(() -> new IllegalStateException("No resume found — upload one first"));

        if (!resume.isParsed() || resume.getParsedJson() == null) {
            throw new IllegalStateException("Resume exists but has not been parsed yet — call POST /api/resumes/parse first");
        }

        // Extract yearsExperience from parsedJson so the prompt can use the exact value
        int yearsExperience = extractYearsExperience(resume.getParsedJson());

        List<Job> jobs = jobRepository.findAll();
        log.info("=== Matching run: user={}, resume={}, jobs={} ===", userEmail, resume.getId(), jobs.size());

        int scored = 0;
        int skipped = 0;

        for (int i = 0; i < jobs.size(); i++) {
            Job job = jobs.get(i);

            if (job.getTitle() == null) {
                skipped++;
                continue;
            }

            try {
                String rawJson = anthropicClient.scoreJob(
                        resume.getParsedJson(),
                        job.getTitle(),
                        job.getDescription(),
                        yearsExperience
                );

                if (rawJson == null) {
                    // Fallback was triggered (circuit open or all retries failed)
                    skipped++;
                    continue;
                }

                JsonNode node = objectMapper.readTree(rawJson);
                int score = Math.min(100, Math.max(0, node.path("score").asInt(0)));
                String reasoning = node.path("reasoning").asText("No reasoning provided");

                upsert(userEmail, job.getId(), score, reasoning);
                scored++;

                if (scored % 10 == 0) {
                    log.info("  Progress: {}/{} scored, {} skipped", scored, jobs.size(), skipped);
                }

            } catch (Exception e) {
                log.warn("  Failed to score job {} ({}): {}", job.getId(), job.getTitle(), e.getMessage());
                skipped++;
            }
        }

        int matchesAbove70 = (int) jobMatchRepository
                .findByUserEmailAndScoreGreaterThanEqualOrderByScoreDesc(userEmail, 70)
                .stream().count();

        log.info("=== Matching run complete: scored={}, skipped={}, above70={} ===", scored, skipped, matchesAbove70);
        return new MatchSummary(jobs.size(), scored, matchesAbove70);
    }

    /**
     * Returns matches for a user at or above minScore, enriched with job details.
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

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void upsert(String userEmail, Long jobId, int score, String reasoning) {
        Optional<JobMatch> existing = jobMatchRepository.findByUserEmailAndJobId(userEmail, jobId);
        JobMatch match = existing.orElseGet(JobMatch::new);
        match.setUserEmail(userEmail);
        match.setJobId(jobId);
        match.setScore(score);
        match.setReasoning(reasoning);
        match.setMatchedAt(LocalDateTime.now());
        jobMatchRepository.save(match);
    }

    private int extractYearsExperience(String parsedJson) {
        try {
            return objectMapper.readTree(parsedJson).path("yearsExperience").asInt(0);
        } catch (Exception e) {
            return 0;
        }
    }
}
