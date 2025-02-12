package com.cnesten.medarrivalbackend.OCR.services;

import com.cnesten.medarrivalbackend.OCR.Enums.Language;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class LanguageDetectionService {
    public String getLanguageFromRequest(String language) throws Exception {

        boolean containsFrench = language.contains("fra") || language.contains("french") || language.contains("fr");
        boolean containsArabic = language.contains("ara") || language.contains("arabe") || language.contains("ar");

        if (containsArabic && containsFrench) return Language.ARABE_LATIN.label;
        if (containsFrench) return Language.FRENCH.label;
        if (containsArabic) return Language.ARABE.label;

        throw new Exception("Unsupported Language");
    }

    public boolean isProbablyArabic(String text) {
        return text.matches(".*\\p{InArabic}.*");
    }

    public boolean isProbablyFrench(String text) {
        return text.matches(".*\\p{InFrench}.*");
    }

    public boolean isProbablyMalExtracted (String text){
        List<String> charsIndicatingMalExtract = Arrays.asList("","Ø","Ý","¾","¬", "¿", "¤", "¦", "¨","¼","½","¸","ß","Þ","Ö","","¹","¿","Áّ","","","","","\b","","","","","");
        
        for (String c : charsIndicatingMalExtract){
            if (text.contains(c)) return true;
        }

        return false;
    }


}
