package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Product;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExcelPriceComponentService {
    private final ProductService productService;
    private static final String PRICE_FORMAT = "#,##0.00 \" DH\"";

    public byte[] generatePriceComponentsExcel(Client client) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Price Components");
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle priceStyle = createPriceStyle(workbook);

            // Create header row
            Row headerRow = sheet.createRow(0);
            List<String> headers = new ArrayList<>();
            headers.add("Product ID");
            headers.add("Product Name");
            headers.add("Description");

            // Add headers for each price component type
            for (PriceComponentType type : PriceComponentType.values()) {
                headers.add(type.name());
            }

            // Create headers with style
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            // Get all products
            Pageable unpaged = Pageable.unpaged();
            Page<Product> productPage = productService.findAllWithClientPricing(unpaged, client);
            List<Product> products = productPage.getContent();

            int rowNum = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;

                // Add product details
                row.createCell(colNum++).setCellValue(product.getId());
                row.createCell(colNum++).setCellValue(product.getName());
                row.createCell(colNum++).setCellValue(product.getDescription());

                // Add price components
                for (PriceComponentType type : PriceComponentType.values()) {
                    Cell cell = row.createCell(colNum++);
                    cell.setCellStyle(priceStyle);

                    Float price = product.getCurrentPriceByComponentForClient(type, client);
                    if (price != null) {
                        cell.setCellValue(price);
                    }
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public void importPriceComponents(MultipartFile file, Client client) throws IOException {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Map headers to price component types
            Row headerRow = sheet.getRow(0);
            Map<Integer, PriceComponentType> columnToType = new HashMap<>();

            // Start from column 3 (after Product ID, Name, and Description)
            for (int i = 3; i < headerRow.getLastCellNum(); i++) {
                Cell headerCell = headerRow.getCell(i);
                if (headerCell == null) continue;

                String headerValue = headerCell.getStringCellValue().trim();
                try {
                    PriceComponentType type = PriceComponentType.valueOf(headerValue);
                    columnToType.put(i, type);
                } catch (IllegalArgumentException e) {
                    continue;
                }
            }

            // Process data rows
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Get product ID
                Cell productIdCell = row.getCell(0);
                if (productIdCell == null) continue;

                long productId;
                try {
                    productId = (long) productIdCell.getNumericCellValue();
                } catch (IllegalStateException e) {
                    // Try to parse as string if numeric fails
                    try {
                        productId = Long.parseLong(productIdCell.getStringCellValue().trim());
                    } catch (Exception ex) {
                        continue; // Skip if can't parse ID
                    }
                }

                Map<PriceComponentType, Float> newPrices = new HashMap<>();

                // Read and compare price components
                for (Map.Entry<Integer, PriceComponentType> entry : columnToType.entrySet()) {
                    Cell cell = row.getCell(entry.getKey());
                    if (cell == null) continue;

                    float newValue;
                    try {
                        switch (cell.getCellType()) {
                            case NUMERIC:
                                newValue = (float) cell.getNumericCellValue();
                                break;
                            case STRING:
                                // Remove currency symbol and parse
                                String stringValue = cell.getStringCellValue()
                                        .replace("DH", "")
                                        .replace(",", "")
                                        .trim();
                                newValue = Float.parseFloat(stringValue);
                                break;
                            default:
                                continue;
                        }
                    } catch (Exception e) {
                        continue; // Skip if can't parse price
                    }

                    // Only add if value is valid
                    if (newValue >= 0) {
                        newPrices.put(entry.getValue(), newValue);
                    }
                }

                // If there are any valid prices, update them
                if (!newPrices.isEmpty()) {
                    try {
                        productService.setCustomPricingForClient(productId, client.getId(), newPrices);
                    } catch (Exception e) {
                        // Log error but continue processing other rows
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createPriceStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat(PRICE_FORMAT));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }
}