package com.cnesten.medarrivalbackend.OCR.services.FileProcessor;

import com.cnesten.medarrivalbackend.OCR.services.OcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ImageProcessor implements FileProcessor {

    private final OcrService ocrService;

    @Override
    public String processFile(MultipartFile file, String language) throws IOException {
        return ocrService.performOCR(file, language);
    }
    
}
