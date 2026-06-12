package com.joblens.matching.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Read-only view of the "resumes" table written by resume-service.
 */
@Entity
@Table(name = "resumes")
@Getter
@NoArgsConstructor
public class Resume {

    @Id
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(columnDefinition = "TEXT")
    private String parsedJson;

    private boolean parsed;

    private LocalDateTime uploadedAt;
}
