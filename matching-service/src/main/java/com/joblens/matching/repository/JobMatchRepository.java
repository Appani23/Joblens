package com.joblens.matching.repository;

import com.joblens.matching.model.JobMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobMatchRepository extends JpaRepository<JobMatch, Long> {

    List<JobMatch> findByUserEmailAndScoreGreaterThanEqualOrderByScoreDesc(
            String userEmail, int minScore);

    Optional<JobMatch> findByUserEmailAndJobId(String userEmail, Long jobId);

    @Modifying
    @Transactional
    @Query("DELETE FROM JobMatch m WHERE m.userEmail = :userEmail")
    void deleteByUserEmail(@Param("userEmail") String userEmail);
}
