package com.joblens.matching.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Read/write view of the "jobs" table shared with job-aggregator-service.
 * Matching-service writes jobLevel/workMode/requiredYears back here after scoring.
 */
@Entity
@Table(name = "jobs")
@Getter
@NoArgsConstructor
public class Job {

    @Id
    private Long id;

    private String title;
    private String company;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String applyUrl;

    private String source;
    private Double salaryMin;
    private Double salaryMax;
    private LocalDateTime postedDate;

    @Setter private String jobLevel;
    @Setter private String workMode;
    @Setter private Integer requiredYears;
}
