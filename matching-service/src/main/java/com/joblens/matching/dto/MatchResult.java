package com.joblens.matching.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MatchResult(
        Long jobId,
        int score,
        String reasoning,
        String title,
        String company,
        String location,
        String applyUrl,
        LocalDateTime matchedAt,
        String jobLevel,
        String workMode,
        String description,
        List<String> matchedSkills
) {}
