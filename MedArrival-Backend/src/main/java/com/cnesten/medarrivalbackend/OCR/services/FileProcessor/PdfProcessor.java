package com.cnesten.medarrivalbackend.OCR.services.FileProcessor;

import com.cnesten.medarrivalbackend.OCR.Enums.PdfExtractionStrategy;
import com.cnesten.medarrivalbackend.OCR.services.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PdfProcessor implements FileProcessor{

    private final PdfService pdfService;

    @Override
    public String processFile(MultipartFile file, String language) throws IOException {
        return pdfService.extractTextFromPdf(file.getInputStream(), PdfExtractionStrategy.ADAPTIVE, language);
    }
}
