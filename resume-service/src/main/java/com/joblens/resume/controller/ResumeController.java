package com.joblens.resume.controller;

import com.joblens.resume.dto.ResumeResponse;
import com.joblens.resume.model.Resume;
import com.joblens.resume.repository.ResumeRepository;
import com.joblens.resume.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Slf4j
public class ResumeController {

    private static final long MAX_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final ResumeRepository resumeRepository;
    private final StorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    Principal principal) {
        // Content-type validation
        String contentType = file.getContentType();
        if (!PDF_CONTENT_TYPE.equals(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only PDF files are accepted (received: " + contentType + ")"));
        }

        // Size validation (belt-and-suspenders alongside multipart config)
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File exceeds the 5 MB limit"));
        }

        String userEmail = principal.getName();
        String safeEmail = userEmail.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = safeEmail + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        String storagePath;
        try {
            storagePath = storageService.store(file, key);
        } catch (Exception e) {
            log.error("Failed to store resume for {}: {}", userEmail, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to store file — please try again"));
        }

        Resume resume = Resume.builder()
                .userEmail(userEmail)
                .originalFilename(file.getOriginalFilename())
                .storagePath(storagePath)
                .contentType(contentType)
                .fileSizeBytes(file.getSize())
                .parsed(false)
                .build();
        resumeRepository.save(resume);

        log.info("Resume uploaded — user={}, file={}, bytes={}", userEmail, file.getOriginalFilename(), file.getSize());
        return ResponseEntity.ok(toResponse(resume));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyResume(Principal principal) {
        return resumeRepository
                .findTopByUserEmailOrderByUploadedAtDesc(principal.getName())
                .map(r -> ResponseEntity.ok((Object) toResponse(r)))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "No resume found")));
    }

    private ResumeResponse toResponse(Resume r) {
        return new ResumeResponse(r.getId(), r.getOriginalFilename(), r.getFileSizeBytes(), r.getUploadedAt());
    }
}
