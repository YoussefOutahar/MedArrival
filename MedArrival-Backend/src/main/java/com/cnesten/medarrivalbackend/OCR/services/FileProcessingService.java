package com.cnesten.medarrivalbackend.OCR.services;

import com.cnesten.medarrivalbackend.OCR.services.FileProcessor.ImageProcessor;
import com.cnesten.medarrivalbackend.OCR.services.FileProcessor.PdfProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class FileProcessingService {
    private final ImageProcessor imageProcessor;
    private final PdfProcessor pdfProcessor;

    public String processFile(MultipartFile file, String language) throws IOException {
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();

            if (contentType.startsWith("image")) {
                return imageProcessor.processFile(file, language);
            } else if (contentType.startsWith("application/pdf")) {
                return pdfProcessor.processFile(file, language);
            } else if (contentType.equals("application/octet-stream")) {
                return pdfProcessor.processFile(file, language);
            }
        
        return "Unsupported file type";
    }

    
}
