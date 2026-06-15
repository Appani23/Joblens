package com.joblens.matching.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_matches", uniqueConstraints = {
        @UniqueConstraint(name = "uk_match_user_job", columnNames = {"user_email", "job_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    private int score;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Column(nullable = false)
    private LocalDateTime matchedAt;

    private String jobLevel;
    private String workMode;
}
