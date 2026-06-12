package com.joblens.resume.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;

import java.time.LocalDateTime;

public record ResumeResponse(
        Long id,
        String originalFilename,
        Long fileSizeBytes,
        LocalDateTime uploadedAt,
        boolean parsed,
        @JsonRawValue String parsedJson  // emitted as an inline JSON object, not a string
) {}
