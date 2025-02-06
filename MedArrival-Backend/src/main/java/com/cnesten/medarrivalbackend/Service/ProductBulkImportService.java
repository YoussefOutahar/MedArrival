package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Models.ProductCategory;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductBulkImportService {
    private final ProductService productService;
    private final ProductCategoryService categoryService;

    public List<Product> importProductsFromFile(MultipartFile file) throws IOException {
        List<Product> products;

        if (isExcelFile(file)) {
            products = importProductsFromExcel(file);
        } else if (isCsvFile(file)) {
            products = importProductsFromCsv(file);
        } else {
            throw new IllegalArgumentException("Unsupported file format. Please use CSV or Excel file.");
        }

        List<Product> savedProducts = new ArrayList<>();
        for (Product product : products) {
            savedProducts.add(productService.save(product));
        }
        return savedProducts;
    }

    private List<Product> importProductsFromExcel(MultipartFile file) throws IOException {
        List<Product> products = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rows = sheet.iterator();

        // Skip header row
        if (rows.hasNext()) {
            rows.next();
        }

        while (rows.hasNext()) {
            Row row = rows.next();
            Product product = new Product();

            // Basic product info
            product.setName(getCellValueAsString(row.getCell(0)));
            product.setDescription(getCellValueAsString(row.getCell(1)));

            // Category
            String categoryName = getCellValueAsString(row.getCell(2));
            ProductCategory category = categoryService.findByName(categoryName)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryName));
            product.setCategory(category);

            // Price Components
            addPriceComponent(product, PriceComponentType.PURCHASE_PRICE, getCellValueAsFloat(row.getCell(3)));
            addPriceComponent(product, PriceComponentType.TRANSPORT, getCellValueAsFloat(row.getCell(4)));
            addPriceComponent(product, PriceComponentType.STORAGE, getCellValueAsFloat(row.getCell(5)));
            addPriceComponent(product, PriceComponentType.TRANSIT, getCellValueAsFloat(row.getCell(6)));
            addPriceComponent(product, PriceComponentType.DUANE, getCellValueAsFloat(row.getCell(7)));
            addPriceComponent(product, PriceComponentType.AMSSNUR, getCellValueAsFloat(row.getCell(8)));

            products.add(product);
        }

        workbook.close();
        return products;
    }

    private List<Product> importProductsFromCsv(MultipartFile file) throws IOException {
        List<Product> products = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;

        // Skip header row
        reader.readLine();

        while ((line = reader.readLine()) != null) {
            String[] values = line.split(",");
            Product product = new Product();

            // Basic product info
            product.setName(values[0].trim());
            product.setDescription(values[1].trim());

            // Category
            String categoryName = values[2].trim();
            ProductCategory category = categoryService.findByName(categoryName)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryName));
            product.setCategory(category);

            // Price Components
            addPriceComponent(product, PriceComponentType.PURCHASE_PRICE, Float.parseFloat(values[3].trim()));
            addPriceComponent(product, PriceComponentType.STORAGE, Float.parseFloat(values[4].trim()));
            addPriceComponent(product, PriceComponentType.TRANSIT, Float.parseFloat(values[5].trim()));
            addPriceComponent(product, PriceComponentType.TRANSPORT, Float.parseFloat(values[6].trim()));
            addPriceComponent(product, PriceComponentType.DUANE, Float.parseFloat(values[7].trim()));
            addPriceComponent(product, PriceComponentType.AMSSNUR, Float.parseFloat(values[8].trim()));

            products.add(product);
        }

        reader.close();
        return products;
    }

    private void addPriceComponent(Product product, PriceComponentType type, Float amount) {
        if (amount != null) {
            PriceComponent priceComponent = new PriceComponent();
            priceComponent.setComponentType(type);
            priceComponent.setAmount(amount);
            priceComponent.setEffectiveFrom(LocalDateTime.now());
            product.addPriceComponent(priceComponent);
        }
    }

    // Add template generation methods
    public byte[] generateProductCsvTemplate() {
        StringBuilder csv = new StringBuilder();
        csv.append("Name,Description,Category,Price,Transport & Handling,Magazinage,Transit,Duane,Amssnur\n");
        csv.append("Product A,Description A,Category A,100.00,10.00,5.00,15.00,20.00,5.00\n");
        csv.append("Product B,Description B,Category B,150.00,15.00,7.50,20.00,25.00,7.50");
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateProductExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Products Template");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = createHeaderStyle(workbook);

            String[] headers = {
                    "Name", "Description", "Category",
                    "Purchase Price", "Transport & Handling", "Storage",
                    "Transit", "Customs", "Insurance", "Selling Price"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Add example data
            addExampleProductRow(sheet, 1, "Product A", "Description A", "Category A",
                    100.00f, 10.00f, 5.00f, 15.00f, 20.00f, 5.00f, 200.00f);
            addExampleProductRow(sheet, 2, "Product B", "Description B", "Category B",
                    150.00f, 15.00f, 7.50f, 20.00f, 25.00f, 7.50f, 300.00f);

            // Autosize columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void addExampleProductRow(Sheet sheet, int rowNum, String name, String description,
                                      String category, Float... prices) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(name);
        row.createCell(1).setCellValue(description);
        row.createCell(2).setCellValue(category);

        for (int i = 0; i < prices.length; i++) {
            Cell cell = row.createCell(i + 3);
            cell.setCellValue(prices[i]);
        }
    }

    private boolean isExcelFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
                contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
                        contentType.equals("application/vnd.ms-excel")
        );
    }

    private boolean isCsvFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
                contentType.equals("text/csv") ||
                        contentType.equals("application/csv") ||
                        contentType.equals("application/vnd.ms-excel")
        );
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case BLANK:
                return null;
            default:
                return null;
        }
    }

    private Float getCellValueAsFloat(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case NUMERIC:
                return (float) cell.getNumericCellValue();
            case STRING:
                try {
                    return Float.parseFloat(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    return null;
                }
            case BLANK:
                return null;
            default:
                return null;
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
