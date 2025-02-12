package com.cnesten.medarrivalbackend.OCR.services;

import com.cnesten.medarrivalbackend.OCR.Enums.PdfExtractionStrategy;
import com.cnesten.medarrivalbackend.Utils.ByteArrayMultipartFile;
import lombok.RequiredArgsConstructor;
import org.apache.commons.compress.utils.IOUtils;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class PdfService {
    private final OcrService ocrService;
    private final ImageDetectionEngineService imageDetector;
    private final LanguageDetectionService languageDetectionService;

    @Cacheable(cacheNames = "pdfCache",
            keyGenerator = "customKeyGenerator",
            unless = "#result == null")
    public String extractTextFromPdf(InputStream pdfInputStream, PdfExtractionStrategy strategy, String language) throws IOException {
        String output = "";

        if (PdfExtractionStrategy.ADAPTIVE.equals(strategy))
            output = adaptiveExtract(pdfInputStream,language);

        if (PdfExtractionStrategy.NORMAL_EXTRACTION.equals(strategy))
            output = adaptiveExtract(pdfInputStream,language);

        if (PdfExtractionStrategy.TRANSFORM_TO_IMAGE.equals(strategy))
            output = extractTextFromPdfWithImageTransform(pdfInputStream,language);

        return output;
    }

    @Cacheable(cacheNames = "pdfCache",
            keyGenerator = "customKeyGenerator",
            unless = "#result == null")
    public String adaptiveExtract(InputStream pdfInputStream, String language) {
        StringBuilder pdfTextBuilder = new StringBuilder();
        List<CompletableFuture<String>> futures = new ArrayList<>();

        try (PDDocument document = Loader.loadPDF(IOUtils.toByteArray(pdfInputStream))) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            PDFRenderer pdfRenderer = new PDFRenderer(document);

            for (int pageIndex = 0; pageIndex < document.getNumberOfPages(); pageIndex++) {
                futures.add(processPageAsync(document, pdfRenderer, pdfStripper, pageIndex, language));
            }

            for (CompletableFuture<String> future : futures) {
                pdfTextBuilder.append(future.get());
            }

            return pdfTextBuilder.toString();
        } catch (IOException | InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return "Error extracting text from PDF";
        }
    }

    @Async
    public CompletableFuture<String> processPageAsync(PDDocument document, PDFRenderer pdfRenderer, PDFTextStripper pdfStripper, int pageIndex, String language) {
        try {
            imageDetector.resetImageFoundFlag();
            imageDetector.processPage(document.getPage(pageIndex));
            String resultantString;

            pdfStripper.setStartPage(pageIndex + 1);
            pdfStripper.setEndPage(pageIndex + 1);

            resultantString = pdfStripper.getText(document);

            StringEscapeUtils.escapeJava(resultantString);

            boolean isMalExtracted = languageDetectionService.isProbablyMalExtracted(resultantString);
            boolean isPdfEmpty = resultantString.replaceAll("[\\n\\t\\\\s\\r]", "").isEmpty();
            boolean isImageFound = imageDetector.isImageFound();

            if (isMalExtracted || isPdfEmpty || isImageFound) {
                resultantString = getImageTextWithOCR(pdfRenderer, pageIndex, language);
            }

            return CompletableFuture.completedFuture(resultantString);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String extractTextFromPdfWithImageTransform(InputStream pdfInputStream,String language) {
        StringBuilder allPagesText = new StringBuilder();

        try (PDDocument document = Loader.loadPDF(IOUtils.toByteArray(pdfInputStream))) {
            PDFRenderer pdfRenderer = new PDFRenderer(document);

            for (int page = 0; page < document.getNumberOfPages(); ++page) {
                allPagesText.append(getImageTextWithOCR(pdfRenderer, page,language));
            }

            return allPagesText.toString();
        } catch (IOException e) {
            e.printStackTrace();
            return "Error extracting text from PDF";
        }
    }

    private String getImageTextWithOCR(PDFRenderer pdfRenderer, int pageIndex, String language) throws IOException {
        String resultantString = "";

        BufferedImage image = pdfRenderer.renderImageWithDPI(pageIndex, 150);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, "png", baos);
            byte[] imageInByte = baos.toByteArray();
            baos.close();

            // Create MultipartFile from byte array
            MultipartFile multipartFile = new ByteArrayMultipartFile(
                    "PDF.png",           // filename
                    "PDF.png",           // originalFilename
                    "image/png",         // contentType
                    imageInByte          // content
            );

            resultantString = ocrService.performOCR(multipartFile, languageDetectionService.getLanguageFromRequest(language));
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return resultantString;
    }
}
