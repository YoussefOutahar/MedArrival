package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Repository.SaleRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductPricingReportService {

    private final SaleRepository saleRepository;

    public byte[] generatePricingReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Sale> sales = saleRepository.findByDateRange(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Pricing Report");

            // Set column widths
            sheet.setColumnWidth(0, 8000);  // Les produits
            sheet.setColumnWidth(1, 3000);  // Qtée achetée
            sheet.setColumnWidth(2, 3000);  // PUA
            sheet.setColumnWidth(3, 3000);  // PTA
            sheet.setColumnWidth(4, 3000);  // Transport
            sheet.setColumnWidth(5, 3000);  // PT Environné

            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle totalStyle = createTotalStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);

            // Create date range header
            createDateRangeHeader(sheet, workbook, startDate, endDate);

            // Create headers
            Row headerRow = sheet.createRow(1);
            String[] headers = {
                    "Les produits",
                    "Qtée achetée",
                    "PUA",
                    "PTA",
                    "Transport",
                    "PT Environné"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Add total row
            Row totalRow = sheet.createRow(2);
            totalRow.setRowStyle(totalStyle);

            int totalQuantity = sales.stream().mapToInt(Sale::getQuantity).sum();
            double totalPTA = sales.stream().mapToDouble(Sale::getTotalAmount).sum();
            double totalTransport = calculateTotalTransport(sales);
            double totalEnvironne = totalPTA + totalTransport;

            totalRow.createCell(1).setCellValue(totalQuantity);
            totalRow.createCell(3).setCellValue(totalPTA);
            totalRow.createCell(4).setCellValue(totalTransport);
            totalRow.createCell(5).setCellValue(totalEnvironne);

            // Group sales by product and sum quantities
            Map<Product, SalesSummary> productSummaries = sales.stream()
                    .collect(Collectors.groupingBy(
                            Sale::getProduct,
                            Collectors.collectingAndThen(
                                    Collectors.toList(),
                                    this::createSalesSummary
                            )
                    ));

            // Add data rows
            int rowNum = 3;
            for (Map.Entry<Product, SalesSummary> entry : productSummaries.entrySet()) {
                Product product = entry.getKey();
                SalesSummary summary = entry.getValue();

                Row row = sheet.createRow(rowNum++);

                // Product name
                row.createCell(0).setCellValue(product.getName());

                // Total quantity
                row.createCell(1).setCellValue(summary.getTotalQuantity());

                // Average PUA (Unit price)
                Cell puaCell = row.createCell(2);
                puaCell.setCellValue(summary.getAverageUnitPrice());
                puaCell.setCellStyle(numberStyle);

                // Total PTA
                Cell ptaCell = row.createCell(3);
                ptaCell.setCellValue(summary.getTotalAmount());
                ptaCell.setCellStyle(numberStyle);

                // Transport
                Cell transportCell = row.createCell(4);
                double transport = calculateTransport(product, summary.getTotalQuantity());
                transportCell.setCellValue(transport);
                transportCell.setCellStyle(numberStyle);

                // PT Environné
                Cell environneCell = row.createCell(5);
                environneCell.setCellValue(summary.getTotalAmount() + transport);
                environneCell.setCellStyle(numberStyle);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate pricing report", e);
        }
    }

    private void createDateRangeHeader(Sheet sheet, Workbook workbook, LocalDateTime startDate, LocalDateTime endDate) {
        Row dateRow = sheet.createRow(0);
        Cell dateCell = dateRow.createCell(0);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String dateRange = String.format("Période: %s - %s",
                startDate.format(formatter),
                endDate.format(formatter));

        CellStyle dateStyle = workbook.createCellStyle();
        Font dateFont = workbook.createFont();
        dateFont.setBold(true);
        dateStyle.setFont(dateFont);

        dateCell.setCellValue(dateRange);
        dateCell.setCellStyle(dateStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
    }

    @Data
    @AllArgsConstructor
    private static class SalesSummary {
        private int totalQuantity;
        private double totalAmount;
        private double averageUnitPrice;
    }

    private SalesSummary createSalesSummary(List<Sale> sales) {
        int totalQuantity = sales.stream().mapToInt(Sale::getQuantity).sum();
        double totalAmount = sales.stream().mapToDouble(Sale::getTotalAmount).sum();
        double averageUnitPrice = totalAmount / totalQuantity;

        return new SalesSummary(totalQuantity, totalAmount, averageUnitPrice);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        return style;
    }

    private double calculateTransport(Product product, int quantity) {
        float transportPrice = product.getCurrentPriceByComponent(PriceComponentType.TRANSPORT);
        return transportPrice * quantity;
    }

    private double calculateTotalTransport(List<Sale> sales) {
        return sales.stream()
                .mapToDouble(sale -> calculateTransport(sale.getProduct(), sale.getQuantity()))
                .sum();
    }
}