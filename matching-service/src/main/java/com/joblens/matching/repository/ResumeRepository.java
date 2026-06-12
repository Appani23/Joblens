package com.joblens.matching.repository;

import com.joblens.matching.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findTopByUserEmailOrderByUploadedAtDesc(String userEmail);
}
