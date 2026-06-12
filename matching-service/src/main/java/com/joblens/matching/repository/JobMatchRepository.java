package com.joblens.matching.repository;

import com.joblens.matching.model.JobMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobMatchRepository extends JpaRepository<JobMatch, Long> {

    Optional<JobMatch> findByUserEmailAndJobId(String userEmail, Long jobId);

    List<JobMatch> findByUserEmailAndScoreGreaterThanEqualOrderByScoreDesc(
            String userEmail, int minScore);
}
