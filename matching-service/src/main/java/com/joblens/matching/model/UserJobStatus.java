package com.joblens.matching.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_job_status", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_job_status", columnNames = {"user_email", "job_id"})
})
@Getter @Setter @NoArgsConstructor
public class UserJobStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    private boolean favorited;
    private boolean applied;
    private LocalDateTime favoritedAt;
    private LocalDateTime appliedAt;
}
