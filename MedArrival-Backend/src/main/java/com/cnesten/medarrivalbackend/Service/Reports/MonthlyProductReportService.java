package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Projections.MonthlySaleProjection;
import com.cnesten.medarrivalbackend.Repository.SaleRepository;
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

@Service
@RequiredArgsConstructor
public class MonthlyProductReportService {

    private final SaleRepository saleRepository;

    public byte[] generateMonthlyProductReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<MonthlySaleProjection> sales = saleRepository.findMonthlySalesSummary(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Monthly Product Report");

            // Set column widths
            sheet.setColumnWidth(0, 8000);  // Les produits
            sheet.setColumnWidth(1, 3000);  // Qtée achetée
            sheet.setColumnWidth(2, 3500);  // PU de vente
            sheet.setColumnWidth(3, 3500);  // CA
            sheet.setColumnWidth(4, 3500);  // CA/Pdt

            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle totalStyle = createTotalStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook);

            // Create title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy", new Locale("fr"));
            String dateRange = String.format("BILAN PRODUIT DU %s AU %s",
                    startDate.format(formatter),
                    endDate.format(formatter));
            titleCell.setCellValue(dateRange.toUpperCase());
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

            // Create headers
            Row headerRow = sheet.createRow(2);
            String[] headers = {"Les produits", "Qtée achetée", "PU de vente", "CA", "CA/Pdt"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Formula for calculations
            int currentRow = 3;
            int totalQuantity = 0;
            double totalCA = 0;

            // Add data rows
            for (MonthlySaleProjection sale : sales) {
                Row row = sheet.createRow(currentRow++);

                Cell productCell = row.createCell(0);
                productCell.setCellValue(sale.getProduct().getName());

                Cell quantityCell = row.createCell(1);
                quantityCell.setCellValue(sale.getQuantity());
                totalQuantity += sale.getQuantity();

                Cell priceCell = row.createCell(2);
                priceCell.setCellValue(sale.getUnitPrice());
                priceCell.setCellStyle(numberStyle);

                Cell caCell = row.createCell(3);
                caCell.setCellValue(sale.getTotalAmount());
                caCell.setCellStyle(numberStyle);
                totalCA += sale.getTotalAmount();

                Cell caPdtCell = row.createCell(4);
                caPdtCell.setCellValue(sale.getTotalAmount());
                caPdtCell.setCellStyle(numberStyle);
            }

            // Add totals row
            Row totalRow = sheet.createRow(currentRow);
            totalRow.createCell(1).setCellValue(totalQuantity);
            Cell totalCACell = totalRow.createCell(4);
            totalCACell.setCellValue(totalCA);
            totalCACell.setCellStyle(totalStyle);

            // Add summary boxes
            int summaryStartRow = 3;
            Row caGlobalRow = sheet.createRow(summaryStartRow);
            Cell caGlobalLabelCell = caGlobalRow.createCell(6);
            caGlobalLabelCell.setCellValue("CA global =");
            Cell caGlobalValueCell = caGlobalRow.createCell(7);
            caGlobalValueCell.setCellValue(totalCA);
            caGlobalValueCell.setCellStyle(summaryStyle);

            Row caPdtRow = sheet.createRow(summaryStartRow + 2);
            Cell caPdtLabelCell = caPdtRow.createCell(6);
            caPdtLabelCell.setCellValue("CA/Pdt =");
            Cell caPdtValueCell = caPdtRow.createCell(7);
            caPdtValueCell.setCellValue(totalCA);
            caPdtValueCell.setCellStyle(summaryStyle);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate monthly product report", e);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        return style;
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = createNumberStyle(workbook);
        style.setFillForegroundColor(IndexedColors.RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = createNumberStyle(workbook);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}