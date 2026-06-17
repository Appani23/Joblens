package com.joblens.matching.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.joblens.matching.dto.AppliedRequest;
import com.joblens.matching.dto.FavoriteRequest;
import com.joblens.matching.dto.JobStatusEntry;
import com.joblens.matching.model.Job;
import com.joblens.matching.model.JobMatch;
import com.joblens.matching.model.UserJobStatus;
import com.joblens.matching.repository.JobMatchRepository;
import com.joblens.matching.repository.JobRepository;
import com.joblens.matching.repository.UserJobStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

@RestController
@RequestMapping("/api/jobs-status")
@RequiredArgsConstructor
public class UserJobStatusController {

    private final UserJobStatusRepository statusRepository;
    private final JobRepository jobRepository;
    private final JobMatchRepository jobMatchRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/favorite")
    @Transactional
    public ResponseEntity<Void> setFavorite(@RequestBody FavoriteRequest req, Principal principal) {
        upsert(principal.getName(), req.jobId(), s -> {
            s.setFavorited(req.favorited());
            if (req.favorited()) s.setFavoritedAt(LocalDateTime.now());
        });
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/applied")
    @Transactional
    public ResponseEntity<Void> setApplied(@RequestBody AppliedRequest req, Principal principal) {
        upsert(principal.getName(), req.jobId(), s -> {
            s.setApplied(req.applied());
            if (req.applied()) s.setAppliedAt(LocalDateTime.now());
        });
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<JobStatusEntry>> getMyStatus(Principal principal) {
        String email = principal.getName();
        List<JobStatusEntry> entries = statusRepository.findByUserEmail(email).stream()
                .filter(s -> s.isFavorited() || s.isApplied())
                .map(s -> enrich(s, email))
                .toList();
        return ResponseEntity.ok(entries);
    }

    private void upsert(String userEmail, Long jobId, Consumer<UserJobStatus> mutate) {
        UserJobStatus status = statusRepository.findByUserEmailAndJobId(userEmail, jobId)
                .orElseGet(() -> {
                    var s = new UserJobStatus();
                    s.setUserEmail(userEmail);
                    s.setJobId(jobId);
                    return s;
                });
        mutate.accept(status);
        statusRepository.save(status);
    }

    private JobStatusEntry enrich(UserJobStatus s, String userEmail) {
        Job job = jobRepository.findById(s.getJobId()).orElse(null);
        Optional<JobMatch> match = jobMatchRepository.findByUserEmailAndJobId(userEmail, s.getJobId());

        return new JobStatusEntry(
                s.getJobId(),
                s.isFavorited(), s.getFavoritedAt(),
                s.isApplied(), s.getAppliedAt(),
                job != null ? job.getTitle() : "(job removed)",
                job != null ? job.getCompany() : null,
                job != null ? job.getLocation() : null,
                job != null ? job.getApplyUrl() : null,
                job != null ? job.getDescription() : null,
                job != null ? job.getJobLevel() : null,
                job != null ? job.getWorkMode() : null,
                job != null ? job.getSalaryMin() : null,
                job != null ? job.getSalaryMax() : null,
                job != null ? job.getSource() : null,
                match.map(JobMatch::getScore).orElse(null),
                match.map(JobMatch::getReasoning).orElse(null),
                match.map(m -> parseSkills(m.getMatchedSkills())).orElse(null)
        );
    }

    private List<String> parseSkills(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
