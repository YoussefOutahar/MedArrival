package com.cnesten.medarrivalbackend.Service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class TemplateGeneratorService {

    public byte[] generateClientCsvTemplate() {
        StringBuilder csv = new StringBuilder();
        csv.append("Name,Quantity,Address,ClientType\n");
        csv.append("John Doe,10,123 Main St,RETAIL\n");
        csv.append("Jane Smith,5,456 Oak Ave,WHOLESALE");
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateSupplierCsvTemplate() {
        StringBuilder csv = new StringBuilder();
        csv.append("Name,Address,Phone,Email\n");
        csv.append("Supplier A,789 Supply St,123-456-7890,supplierA@example.com\n");
        csv.append("Supplier B,321 Vendor Ave,098-765-4321,supplierB@example.com");
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateClientExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Clients Template");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = createHeaderStyle(workbook);

            String[] headers = {"Name", "Quantity", "Address", "ClientType"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Add example data
            Row dataRow1 = sheet.createRow(1);
            dataRow1.createCell(0).setCellValue("John Doe");
            dataRow1.createCell(1).setCellValue(10);
            dataRow1.createCell(2).setCellValue("123 Main St");
            dataRow1.createCell(3).setCellValue("RETAIL");

            Row dataRow2 = sheet.createRow(2);
            dataRow2.createCell(0).setCellValue("Jane Smith");
            dataRow2.createCell(1).setCellValue(5);
            dataRow2.createCell(2).setCellValue("456 Oak Ave");
            dataRow2.createCell(3).setCellValue("WHOLESALE");

            // Autosize columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] generateSupplierExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Suppliers Template");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = createHeaderStyle(workbook);

            String[] headers = {"Name", "Address", "Phone", "Email"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Add example data
            Row dataRow1 = sheet.createRow(1);
            dataRow1.createCell(0).setCellValue("Supplier A");
            dataRow1.createCell(1).setCellValue("789 Supply St");
            dataRow1.createCell(2).setCellValue("123-456-7890");
            dataRow1.createCell(3).setCellValue("supplierA@example.com");

            Row dataRow2 = sheet.createRow(2);
            dataRow2.createCell(0).setCellValue("Supplier B");
            dataRow2.createCell(1).setCellValue("321 Vendor Ave");
            dataRow2.createCell(2).setCellValue("098-765-4321");
            dataRow2.createCell(3).setCellValue("supplierB@example.com");

            // Autosize columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);

        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        return headerStyle;
    }
}
