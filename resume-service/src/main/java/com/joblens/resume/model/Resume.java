package com.joblens.resume.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes", indexes = {
        @Index(name = "idx_resumes_user_email", columnList = "user_email")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    private String originalFilename;

    @Column(length = 1024)
    private String storagePath;

    private String contentType;

    private Long fileSizeBytes;

    @Builder.Default
    @Column(nullable = false)
    private boolean parsed = false;

    // Claude's structured extraction stored as raw JSON text
    @Column(columnDefinition = "TEXT")
    private String parsedJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    private void prePersist() {
        uploadedAt = LocalDateTime.now();
    }
}
