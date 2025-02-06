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
    private final SaleRepository saleRepository;

    public byte[] generateClientSalesForecastReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<ClientSaleForecastProjection> sales = saleRepository.findClientSalesForecast(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sales Forecast");

            // Set column widths
            sheet.setColumnWidth(0, 6000);  // Le client
            sheet.setColumnWidth(1, 8000);  // Le produit RP
            sheet.setColumnWidth(2, 3000);  // Qté Prévue
            sheet.setColumnWidth(3, 4000);  // PU de vente
            sheet.setColumnWidth(4, 4000);  // Vente prévisionnelle
            sheet.setColumnWidth(5, 4000);  // CA/Client prévu

            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle clientStyle = createClientStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook);

            // Create title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            String month = startDate.format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH));
            titleCell.setCellValue("TABLEAU RECAPITULATIF DES VENTES PREVISIONNEL DES RP DU MOIS " + month.toUpperCase());
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            // Create headers
            Row headerRow = sheet.createRow(2);
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

            // Add data rows
            int currentRow = 3;
            String currentClient = "";
            double clientTotal = 0;

            for (ClientSaleForecastProjection sale : sales) {
                Row row = sheet.createRow(currentRow++);

                // Client name (only if changed)
                if (!sale.getClientName().equals(currentClient)) {
                    if (!currentClient.isEmpty()) {
                        // Add client total
                        Cell totalCell = row.createCell(5);
                        totalCell.setCellValue(clientTotal);
                        totalCell.setCellStyle(summaryStyle);
                        currentRow++;
                        row = sheet.createRow(currentRow++);
                    }
                    currentClient = sale.getClientName();
                    clientTotal = 0;
                }

                Cell clientCell = row.createCell(0);
                clientCell.setCellValue(sale.getClientName());
                clientCell.setCellStyle(clientStyle);

                Cell productCell = row.createCell(1);
                productCell.setCellValue(sale.getProductName());

                Cell quantityCell = row.createCell(2);
                quantityCell.setCellValue(sale.getExpectedQuantity());

                Cell priceCell = row.createCell(3);
                priceCell.setCellValue(sale.getUnitPrice());
                priceCell.setCellStyle(numberStyle);

                Cell totalSaleCell = row.createCell(4);
                double saleTotal = sale.getExpectedQuantity() * sale.getUnitPrice();
                totalSaleCell.setCellValue(saleTotal);
                totalSaleCell.setCellStyle(numberStyle);

                clientTotal += saleTotal;
            }

            // Add final client total
            Row lastRow = sheet.createRow(currentRow);
            Cell totalCell = lastRow.createCell(5);
            totalCell.setCellValue(clientTotal);
            totalCell.setCellStyle(summaryStyle);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate client sales forecast report", e);
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
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
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
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createClientStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = createNumberStyle(workbook);
        style.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }
}