package com.cnesten.medarrivalbackend.OCR.Facade;

import com.cnesten.medarrivalbackend.OCR.services.CacheControlService;
import com.cnesten.medarrivalbackend.OCR.services.FileProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ocr")
public class OcrRest {

    @Value("${ocr.var.path}")
    String PATH;

    private final FileProcessingService fileProcessingService;
    private final CacheControlService cacheControlService;

    @PostMapping("/")
    public String performOcr(@RequestPart("file") MultipartFile file, @RequestPart("language") String language) {
        try {
            return fileProcessingService.processFile(file, language);
        } catch (IOException e) {
            e.printStackTrace();
            return "Error processing file";
        }
    }

    @PostMapping("/cache/clear/{cacheName}")
    public ResponseEntity<?> clearCache(@PathVariable String cacheName) {
        cacheControlService.clearCache(cacheName);
        return ResponseEntity.ok()
                .body("Cache '" + cacheName + "' cleared successfully");
    }

    @PostMapping("/cache/clear-all")
    public ResponseEntity<?> clearAllCaches() {
        cacheControlService.clearAllCaches();
        return ResponseEntity.ok()
                .body("All caches cleared successfully");
    }
}
