package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Projections.ClientSaleForecastProjection;
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
public class ClientSalesForecastService {
    private static final int TITLE_ROW = 0;
    private static final int HEADER_ROW = 2;
    private static final int DATA_START_ROW = 3;

    private final SaleRepository saleRepository;

    public byte[] generateClientSalesForecastReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<ClientSaleForecastProjection> sales = saleRepository.findClientSalesForecast(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sales Forecast");

            setupColumns(sheet);
            createTitle(sheet, workbook, startDate, endDate);
            createHeaders(sheet, workbook);
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
            throw new RuntimeException("Failed to generate client sales forecast report", e);
        }
    }

    private void setupColumns(Sheet sheet) {
        sheet.setColumnWidth(0, 8000);  // Le client
        sheet.setColumnWidth(1, 8000);  // Le produit RP
        sheet.setColumnWidth(2, 4500);  // Qté Prévue
        sheet.setColumnWidth(3, 4500);  // PU de vente
        sheet.setColumnWidth(4, 4500);  // Vente prévisionnelle
        sheet.setColumnWidth(5, 4500);  // CA/Client prévu
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
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy", new Locale("fr"));
        String dateRange = String.format("TABLEAU RECAPITULATIF DES VENTES PREVISIONNEL DES RP DU %s AU %s",
                startDate.format(formatter),
                endDate.format(formatter));

        titleCell.setCellValue(dateRange.toUpperCase());
        titleCell.setCellStyle(createTitleStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
    }

    private void createHeaders(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(HEADER_ROW);
        headerRow.setHeight((short)-1);
        CellStyle headerStyle = createHeaderStyle(workbook);

        String[] headers = {
                "Le client",
                "Le produit RP",
                "Qté Prévue d'être livrée",
                "PU de vente selon la grille",
                "Vente prévisionnelle",
                "CA/Client prévu"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void createDataRows(Sheet sheet, Workbook workbook, List<ClientSaleForecastProjection> sales) {
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle clientStyle = createClientStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle summaryStyle = createSummaryStyle(workbook);

        int currentRow = DATA_START_ROW;
        String currentClient = "";
        double clientTotal = 0;

        for (ClientSaleForecastProjection sale : sales) {
            Row row = sheet.createRow(currentRow++);
            row.setHeight((short)-1);

            // Client name (only if changed)
            if (!sale.getClientName().equals(currentClient)) {
                if (!currentClient.isEmpty()) {
                    // Add client total
                    Cell totalCell = row.createCell(5);
                    totalCell.setCellValue(clientTotal);
                    totalCell.setCellStyle(summaryStyle);
                    currentRow++;
                    row = sheet.createRow(currentRow++);
                    row.setHeight((short)-1);
                }
                currentClient = sale.getClientName();
                clientTotal = 0;
            }

            // Client name
            Cell clientCell = row.createCell(0);
            clientCell.setCellValue(sale.getClientName());
            clientCell.setCellStyle(clientStyle);

            // Product name
            Cell productCell = row.createCell(1);
            productCell.setCellValue(sale.getProductName());
            productCell.setCellStyle(dataStyle);

            // Expected Quantity
            Cell quantityCell = row.createCell(2);
            quantityCell.setCellValue(sale.getExpectedQuantity());
            quantityCell.setCellStyle(numberStyle);

            // Unit Price
            Cell priceCell = row.createCell(3);
            priceCell.setCellValue(sale.getUnitPrice());
            priceCell.setCellStyle(numberStyle);

            // Total Sale
            Cell totalSaleCell = row.createCell(4);
            double saleTotal = sale.getExpectedQuantity() * sale.getUnitPrice();
            totalSaleCell.setCellValue(saleTotal);
            totalSaleCell.setCellStyle(numberStyle);

            clientTotal += saleTotal;
        }

        // Add final client total
        Row lastRow = sheet.createRow(currentRow);
        lastRow.setHeight((short)-1);
        Cell totalCell = lastRow.createCell(5);
        totalCell.setCellValue(clientTotal);
        totalCell.setCellStyle(summaryStyle);
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

    private CellStyle createClientStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = createNumberStyle(workbook);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }
}