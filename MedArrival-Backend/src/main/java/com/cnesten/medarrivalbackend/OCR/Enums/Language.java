package com.cnesten.medarrivalbackend.OCR.Enums;

public enum Language {
    ARABE("ara"),
    FRENCH("fra"),
    ENGLISH("eng"),
    ARABE_LATIN("fra+ara");

    public final String label;

    private Language(String label) {
        this.label = label;
    }
    
}
