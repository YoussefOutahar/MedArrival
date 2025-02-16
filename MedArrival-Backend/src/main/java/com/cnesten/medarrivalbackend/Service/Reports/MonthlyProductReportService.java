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

    private static final int TITLE_ROW = 0;
    private static final int HEADER_ROW = 2;
    private static final int DATA_START_ROW = 3;
    private final SaleRepository saleRepository;

    public byte[] generateMonthlyProductReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<MonthlySaleProjection> sales = saleRepository.findMonthlySalesSummary(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Monthly Product Report");

            setupColumns(sheet);
            createTitle(sheet, workbook, startDate, endDate);
            createHeaders(sheet, workbook);
            createDataSection(sheet, workbook, sales);

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
            throw new RuntimeException("Failed to generate monthly product report", e);
        }
    }

    private void setupColumns(Sheet sheet) {
        sheet.setColumnWidth(0, 8000);  // Les produits
        sheet.setColumnWidth(1, 4000);  // Qtée achetée
        sheet.setColumnWidth(2, 4500);  // PU de vente
        sheet.setColumnWidth(3, 4500);  // CA
        sheet.setColumnWidth(4, 4500);  // CA/Pdt
        sheet.setColumnWidth(6, 4500);  // Summary labels
        sheet.setColumnWidth(7, 4500);  // Summary values
    }

    private void addCommonStyleProperties(CellStyle style) {
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void createTitle(Sheet sheet, Workbook workbook, LocalDateTime startDate, LocalDateTime endDate) {
        Row titleRow = sheet.createRow(TITLE_ROW);
        Cell titleCell = titleRow.createCell(0);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy", new Locale("fr"));
        String dateRange = String.format("BILAN PRODUIT DU %s AU %s",
                startDate.format(formatter),
                endDate.format(formatter));
        titleCell.setCellValue(dateRange.toUpperCase());
        titleCell.setCellStyle(createTitleStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));
    }

    private void createHeaders(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(HEADER_ROW);
        headerRow.setHeight((short)-1); // Auto height
        CellStyle headerStyle = createHeaderStyle(workbook);

        String[] headers = {"Les produits", "Qtée achetée", "PU de vente", "CA", "CA/Pdt"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void createDataSection(Sheet sheet, Workbook workbook, List<MonthlySaleProjection> sales) {
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle totalStyle = createTotalStyle(workbook);
        CellStyle summaryStyle = createSummaryStyle(workbook);

        int currentRow = DATA_START_ROW;
        int totalQuantity = 0;
        double totalCA = 0;

        // Add data rows
        for (MonthlySaleProjection sale : sales) {
            Row row = sheet.createRow(currentRow++);
            row.setHeight((short)-1); // Auto height

            Cell productCell = row.createCell(0);
            productCell.setCellValue(sale.getProduct().getName());
            productCell.setCellStyle(dataStyle);

            Cell quantityCell = row.createCell(1);
            quantityCell.setCellValue(sale.getQuantity());
            quantityCell.setCellStyle(numberStyle);
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
        totalRow.setHeight((short)-1); // Auto height
        Cell totalQuantityCell = totalRow.createCell(1);
        totalQuantityCell.setCellValue(totalQuantity);
        totalQuantityCell.setCellStyle(totalStyle);

        Cell totalCACell = totalRow.createCell(4);
        totalCACell.setCellValue(totalCA);
        totalCACell.setCellStyle(totalStyle);

        // Add summary boxes
        createSummaryBoxes(sheet, workbook, totalCA);
    }

    private void createSummaryBoxes(Sheet sheet, Workbook workbook, double totalCA) {
        CellStyle summaryStyle = createSummaryStyle(workbook);
        CellStyle summaryLabelStyle = createSummaryLabelStyle(workbook);

        // CA Global
        Row caGlobalRow = sheet.createRow(DATA_START_ROW);
        caGlobalRow.setHeight((short)-1);

        Cell caGlobalLabelCell = caGlobalRow.createCell(6);
        caGlobalLabelCell.setCellValue("CA global =");
        caGlobalLabelCell.setCellStyle(summaryLabelStyle);

        Cell caGlobalValueCell = caGlobalRow.createCell(7);
        caGlobalValueCell.setCellValue(totalCA);
        caGlobalValueCell.setCellStyle(summaryStyle);

        // CA/Pdt
        Row caPdtRow = sheet.createRow(DATA_START_ROW + 2);
        caPdtRow.setHeight((short)-1);

        Cell caPdtLabelCell = caPdtRow.createCell(6);
        caPdtLabelCell.setCellValue("CA/Pdt =");
        caPdtLabelCell.setCellStyle(summaryLabelStyle);

        Cell caPdtValueCell = caPdtRow.createCell(7);
        caPdtValueCell.setCellValue(totalCA);
        caPdtValueCell.setCellStyle(summaryStyle);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
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

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = createNumberStyle(workbook);
        Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = createNumberStyle(workbook);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createSummaryLabelStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }
}