package com.controller;

import com.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private S3Service s3Service;

    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam String filename,
            @RequestParam String contentType) {
            
        // Generate a unique object key to prevent overwriting
        String extension = "";
        if (filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf("."));
        }
        String objectKey = UUID.randomUUID().toString() + extension;
        
        String presignedUrl = s3Service.generatePreSignedUrl(objectKey, contentType);
        String publicUrl = s3Service.getPublicUrl(objectKey);

        Map<String, String> response = new HashMap<>();
        response.put("presignedUrl", presignedUrl);
        response.put("publicUrl", publicUrl);
        response.put("objectKey", objectKey);

        return ResponseEntity.ok(response);
    }
}
