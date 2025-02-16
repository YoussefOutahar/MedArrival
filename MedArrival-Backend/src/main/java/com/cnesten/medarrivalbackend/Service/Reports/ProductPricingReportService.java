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
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductPricingReportService {

    private static final int TITLE_ROW = 0;
    private static final int HEADER_ROW = 1;
    private static final int TOTAL_ROW = 2;
    private static final int DATA_START_ROW = 3;

    private final SaleRepository saleRepository;

    public byte[] generatePricingReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Sale> sales = saleRepository.findByDateRange(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Pricing Report");

            setupColumns(sheet);
            createDateRangeHeader(sheet, workbook, startDate, endDate);
            createHeaders(sheet, workbook);
            createTotalRow(sheet, workbook, sales);
            createDataRows(sheet, workbook, sales);

            // Adjust all rows to fit content
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    row.setHeight((short)-1);
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate pricing report", e);
        }
    }

    private void setupColumns(Sheet sheet) {
        sheet.setColumnWidth(0, 8000);  // Les produits
        sheet.setColumnWidth(1, 4000);  // Qtée achetée
        sheet.setColumnWidth(2, 4500);  // PUA
        sheet.setColumnWidth(3, 4500);  // PTA
        sheet.setColumnWidth(4, 4500);  // Transport
        sheet.setColumnWidth(5, 4500);  // PT Environné
    }

    private void addCommonStyleProperties(CellStyle style) {
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void createDateRangeHeader(Sheet sheet, Workbook workbook, LocalDateTime startDate, LocalDateTime endDate) {
        Row dateRow = sheet.createRow(TITLE_ROW);
        dateRow.setHeight((short)-1);
        Cell dateCell = dateRow.createCell(0);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy", new Locale("fr"));
        String dateRange = String.format("RAPPORT DE PRIX DU %s AU %s",
                startDate.format(formatter),
                endDate.format(formatter));

        dateCell.setCellValue(dateRange.toUpperCase());
        dateCell.setCellStyle(createTitleStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
    }

    private void createHeaders(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(HEADER_ROW);
        headerRow.setHeight((short)-1);
        CellStyle headerStyle = createHeaderStyle(workbook);

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
    }

    private void createTotalRow(Sheet sheet, Workbook workbook, List<Sale> sales) {
        Row totalRow = sheet.createRow(TOTAL_ROW);
        totalRow.setHeight((short)-1);
        CellStyle totalStyle = createTotalStyle(workbook);

        int totalQuantity = sales.stream().mapToInt(Sale::getQuantity).sum();
        double totalPTA = sales.stream().mapToDouble(Sale::getTotalAmount).sum();
        double totalTransport = calculateTotalTransport(sales);
        double totalEnvironne = totalPTA + totalTransport;

        Cell totalQuantityCell = totalRow.createCell(1);
        totalQuantityCell.setCellValue(totalQuantity);
        totalQuantityCell.setCellStyle(totalStyle);

        Cell totalPTACell = totalRow.createCell(3);
        totalPTACell.setCellValue(totalPTA);
        totalPTACell.setCellStyle(totalStyle);

        Cell totalTransportCell = totalRow.createCell(4);
        totalTransportCell.setCellValue(totalTransport);
        totalTransportCell.setCellStyle(totalStyle);

        Cell totalEnvironneCell = totalRow.createCell(5);
        totalEnvironneCell.setCellValue(totalEnvironne);
        totalEnvironneCell.setCellStyle(totalStyle);
    }

    private void createDataRows(Sheet sheet, Workbook workbook, List<Sale> sales) {
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        Map<Product, SalesSummary> productSummaries = sales.stream()
                .collect(Collectors.groupingBy(
                        Sale::getProduct,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                this::createSalesSummary
                        )
                ));

        int rowNum = DATA_START_ROW;
        for (Map.Entry<Product, SalesSummary> entry : productSummaries.entrySet()) {
            Product product = entry.getKey();
            SalesSummary summary = entry.getValue();

            Row row = sheet.createRow(rowNum++);
            row.setHeight((short)-1);

            // Product name
            Cell productCell = row.createCell(0);
            productCell.setCellValue(product.getName());
            productCell.setCellStyle(dataStyle);

            // Total quantity
            Cell quantityCell = row.createCell(1);
            quantityCell.setCellValue(summary.getTotalQuantity());
            quantityCell.setCellStyle(numberStyle);

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
            double transport = sales.stream()
                    .filter(s -> s.getProduct().equals(product))
                    .mapToDouble(this::calculateTransport)
                    .sum();
            transportCell.setCellValue(transport);
            transportCell.setCellStyle(numberStyle);

            // PT Environné
            Cell environneCell = row.createCell(5);
            environneCell.setCellValue(summary.getTotalAmount() + transport);
            environneCell.setCellStyle(numberStyle);
        }
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

        double totalAmount = sales.stream()
                .mapToDouble(sale ->
                        sale.getPriceComponents().stream()
                                .filter(pc -> pc.getComponentType() == PriceComponentType.PURCHASE_PRICE)
                                .findFirst()
                                .map(pc -> pc.getAmount() * sale.getQuantity())
                                .orElse(0.0f)
                ).sum();

        double averageUnitPrice = totalQuantity > 0 ? totalAmount / totalQuantity : 0;

        return new SalesSummary(totalQuantity, totalAmount, averageUnitPrice);
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        addCommonStyleProperties(style);
        return style;
    }

    private double calculateTransport(Sale sale) {
        return sale.getPriceComponents().stream()
                .filter(pc -> pc.getComponentType() == PriceComponentType.TRANSPORT)
                .findFirst()
                .map(pc -> pc.getAmount() * sale.getQuantity())
                .orElse(0.0f);
    }

    private double calculateTotalTransport(List<Sale> sales) {
        return sales.stream()
                .mapToDouble(this::calculateTransport)
                .sum();
    }
}