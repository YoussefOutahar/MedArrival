package com.cnesten.medarrivalbackend.OCR.services;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import net.sourceforge.tess4j.ITessAPI;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class OcrService {

    @Value("${ocr.var.path}")
    String PATH;

    private final LanguageDetectionService languageDetectionService;

    private ITesseract tesseract;

    @PostConstruct
    public void init() {
        tesseract = new Tesseract();
        tesseract.setDatapath(PATH);
        tesseract.setPageSegMode(ITessAPI.TessPageSegMode.PSM_AUTO_ONLY);
        tesseract.setOcrEngineMode(ITessAPI.TessOcrEngineMode.OEM_LSTM_ONLY);
        //tesseract.setTessVariable("user_defined_dpi", "300");
    }

    @Cacheable(cacheNames = "ocrCache",
            keyGenerator = "customKeyGenerator",
            unless = "#result == null")
    public String performOCR(MultipartFile imageFile, String language) throws IOException {
        try {
            byte[] bytes = imageFile.getBytes();
            BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(bytes));

            BufferedImage binarizedImage = binarizeImage(bufferedImage);

            tesseract.setLanguage(languageDetectionService.getLanguageFromRequest(language));

            return tesseract.doOCR(binarizedImage);
        } catch (IOException | TesseractException e) {
            e.printStackTrace();
            return "Error performing OCR";
        } catch (Exception e) {
            e.printStackTrace();
            return "Unsupported Language";
        }
    }

    private BufferedImage binarizeImage(BufferedImage inputImage) {
        int width = inputImage.getWidth();
        int height = inputImage.getHeight();
        int[] pixels = inputImage.getRGB(0, 0, width, height, null, 0, width);

        pixels = Arrays.stream(pixels).parallel().map(rgb -> {
            int red = (rgb >> 16) & 0xFF;
            int green = (rgb >> 8) & 0xFF;
            int blue = rgb & 0xFF;
            int gray = (int) (0.2126 * red + 0.7152 * green + 0.0722 * blue); // Convert to grayscale
            return (gray < 128) ? 0xFF000000 : 0xFFFFFFFF; // Apply binary thresholding
        }).toArray();

        BufferedImage binarizedImage = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);
        binarizedImage.setRGB(0, 0, width, height, pixels, 0, width);
        return binarizedImage;
    }

//    private static BufferedImage applyGaussianBlur(BufferedImage image, float sigma) {
//        ImageFilter blurFilter = new ImageFilterProcessor(
//                new org.apache.commons.imaging.filters.ImageFilterGaussianBlur(sigma)
//        );
//        return blurFilter.processImage(SimpleBufferedImageFactory.getBufferedImage(image));
//    }
//
//    private static BufferedImage deskewImage(BufferedImage image) {
//        ImageFilter deskewFilter = new ImageFilterProcessor(
//                new org.apache.commons.imaging.filters.ImageFilterDeskew()
//        );
//        return deskewFilter.processImage(SimpleBufferedImageFactory.getBufferedImage(image));
//    }
}
