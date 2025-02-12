package com.cnesten.medarrivalbackend.OCR.services;

import org.apache.pdfbox.contentstream.PDFStreamEngine;
import org.apache.pdfbox.contentstream.operator.Operator;
import org.apache.pdfbox.cos.COSBase;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class ImageDetectionEngineService extends PDFStreamEngine {
    private boolean imageFound;

    public ImageDetectionEngineService() {
        imageFound = false;
    }

    public boolean isImageFound() {
        return imageFound;
    }

    public void resetImageFoundFlag() {
        imageFound = false;
    }
    @Override
    protected void processOperator(Operator operator, List<COSBase> operands) throws  IOException {
        String operation = operator.getName();
        if (operation.equals("Do")) {
            imageFound = true;
        }
        super.processOperator(operator, operands);
    }
}
