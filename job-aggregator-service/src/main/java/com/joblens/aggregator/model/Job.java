package com.joblens.aggregator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String externalId;

    private String title;
    private String company;
    private String location;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    private String source;

    @Column(columnDefinition = "TEXT")
    private String applyUrl;

    private Double salaryMin;
    private Double salaryMax;

    private LocalDateTime postedDate;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;

    private LocalDateTime lastSeenAt;

    @PrePersist
    private void prePersist() {
        if (fetchedAt == null) {
            fetchedAt = LocalDateTime.now();
        }
    }
}
