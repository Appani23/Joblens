package com.joblens.matching.repository;

import com.joblens.matching.model.UserJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserJobStatusRepository extends JpaRepository<UserJobStatus, Long> {
    List<UserJobStatus> findByUserEmail(String userEmail);
    Optional<UserJobStatus> findByUserEmailAndJobId(String userEmail, Long jobId);
}
