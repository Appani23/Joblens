package com.joblens.resume.dto;

import java.time.LocalDateTime;

public record ResumeResponse(
        Long id,
        String originalFilename,
        Long fileSizeBytes,
        LocalDateTime uploadedAt
) {}
