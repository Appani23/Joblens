package com.joblens.resume.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {

    /**
     * Persists the file under the given key and returns the storage identifier
     * (an absolute path for local storage; an S3 key for cloud storage).
     */
    String store(MultipartFile file, String key) throws IOException;
}
