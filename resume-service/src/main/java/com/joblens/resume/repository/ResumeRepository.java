package com.joblens.resume.repository;

import com.joblens.resume.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserEmailOrderByUploadedAtDesc(String userEmail);

    Optional<Resume> findTopByUserEmailOrderByUploadedAtDesc(String userEmail);
}
