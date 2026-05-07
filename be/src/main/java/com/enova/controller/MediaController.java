package com.enova.controller;

import com.enova.dto.response.ApiResponse;
import com.enova.dto.response.MediaUploadResponse;
import com.enova.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaStorageService mediaStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MediaUploadResponse>> upload(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(ApiResponse.success(mediaStorageService.store(file)));
    }
}
