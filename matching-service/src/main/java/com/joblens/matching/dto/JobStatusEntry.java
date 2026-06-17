package com.joblens.matching.dto;

import java.time.LocalDateTime;
import java.util.List;

public record JobStatusEntry(
        Long jobId,
        boolean favorited,
        LocalDateTime favoritedAt,
        boolean applied,
        LocalDateTime appliedAt,
        String title,
        String company,
        String location,
        String applyUrl,
        String description,
        String jobLevel,
        String workMode,
        Double salaryMin,
        Double salaryMax,
        String source,
        Integer score,
        String reasoning,
        List<String> matchedSkills
) {}
