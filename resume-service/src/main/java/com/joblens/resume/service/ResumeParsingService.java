package com.joblens.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.joblens.resume.client.AnthropicClient;
import com.joblens.resume.model.Resume;
import com.joblens.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeParsingService {

    private final AnthropicClient anthropicClient;
    private final ResumeRepository resumeRepository;
    private final ObjectMapper objectMapper;

    /**
     * Reads the PDF from local storage, sends it to Claude, stores the extracted
     * JSON on the Resume row, and flips parsed=true. Mutates the passed entity
     * so callers can read updated fields without a second DB load.
     */
    public void parse(Resume resume) {
        if (resume.getStoragePath() == null || resume.getStoragePath().isBlank()) {
            log.warn("Resume {} has no storage path — skipping parse", resume.getId());
            return;
        }

        // 1. Read file bytes
        byte[] fileBytes;
        try {
            fileBytes = Files.readAllBytes(Paths.get(resume.getStoragePath()));
        } catch (IOException e) {
            log.error("Cannot read PDF for resume {} at {}: {}", resume.getId(), resume.getStoragePath(), e.getMessage());
            return;
        }

        // 2. Base64 encode and call Claude (circuit breaker + retry inside)
        String base64 = Base64.getEncoder().encodeToString(fileBytes);
        String rawJson = anthropicClient.parse(base64);

        if (rawJson == null) {
            // Fallback was triggered — leave parsed=false
            return;
        }

        // 3. Validate that Claude returned actual JSON (not stray text)
        try {
            objectMapper.readTree(rawJson);
        } catch (Exception e) {
            log.warn("Claude returned non-JSON for resume {}: {}", resume.getId(), rawJson);
            return;
        }

        // 4. Persist
        resume.setParsedJson(rawJson);
        resume.setParsed(true);
        resumeRepository.save(resume);
        log.info("Resume {} parsed successfully", resume.getId());
    }
}
