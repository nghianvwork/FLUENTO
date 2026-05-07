package com.enova.service;

import com.enova.dto.response.MediaUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class MediaStorageService {

    @Value("${media.upload-dir:uploads}")
    private String uploadDir;

    @Value("${media.max-size-mb:20}")
    private int maxSizeMb;

    public MediaUploadResponse store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Empty file");
        }
        long maxBytes = maxSizeMb * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File too large");
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String original = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String filename = UUID.randomUUID() + extension;
        Path path = dir.resolve(filename);
        Files.copy(file.getInputStream(), path);

        return MediaUploadResponse.builder()
                .url("/media/" + filename)
                .filename(filename)
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .build();
    }

    public Path resolvePath(String url) {
        if (url == null) return null;
        String cleaned = url.replace("/media/", "");
        return Paths.get(uploadDir).resolve(cleaned);
    }
}
