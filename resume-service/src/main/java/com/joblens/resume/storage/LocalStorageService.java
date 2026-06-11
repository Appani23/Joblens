package com.joblens.resume.storage;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@Slf4j
public class LocalStorageService implements StorageService {

    @Value("${storage.local.dir:./resume-uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() throws IOException {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        log.info("Resume upload directory: {}", dir.toAbsolutePath());
    }

    @Override
    public String store(MultipartFile file, String key) throws IOException {
        Path target = Paths.get(uploadDir).resolve(key).normalize();
        // Ensure subdirectories within uploadDir exist (e.g. per-user folder)
        Files.createDirectories(target.getParent());
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        String absolutePath = target.toAbsolutePath().toString();
        log.info("Stored file at: {}", absolutePath);
        return absolutePath;
    }
}
