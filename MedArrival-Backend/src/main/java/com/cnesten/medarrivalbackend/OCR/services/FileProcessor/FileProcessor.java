package com.cnesten.medarrivalbackend.OCR.services.FileProcessor;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileProcessor {
    String processFile(MultipartFile file, String language) throws IOException;
}
