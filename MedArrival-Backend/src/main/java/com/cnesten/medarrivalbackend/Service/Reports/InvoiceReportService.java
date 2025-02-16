package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Price.SalePriceComponent;
import com.cnesten.medarrivalbackend.Models.Sale;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceReportService {

    private static final int TITLE_ROW = 0;
    private static final int METADATA_ROW = 1;
    private static final int SUPPLIER_ROW = 3;
    private static final int INVOICE_ROW = 5;
    private static final int DATE_ROW = 6;
    private static final int HEADER_ROW = 8;
    private static final int DATA_START_ROW = 9;

    public byte[] generateInvoiceExcel(Arrival arrival) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Invoice Control");

            setupColumns(sheet);
            createReportHeader(sheet, workbook, arrival);
            createSupplierSection(sheet, workbook, arrival);
            createInvoiceDetails(sheet, workbook, arrival);
            createDataSection(sheet, workbook, arrival);
            createSummarySection(sheet, workbook, arrival);

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
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    private void setupColumns(Sheet sheet) {
        sheet.setColumnWidth(0, 8000);  // Les produits RP
        sheet.setColumnWidth(1, 4000);  // Quantités commandées
        sheet.setColumnWidth(2, 4000);  // Quantités livrées
        sheet.setColumnWidth(3, 6000);  // Le client
        sheet.setColumnWidth(4, 4500);  // PU ACHAT
        sheet.setColumnWidth(5, 4500);  // Transport
        sheet.setColumnWidth(6, 4500);  // Stockage
        sheet.setColumnWidth(7, 4500);  // Transit
        sheet.setColumnWidth(8, 4500);  // Douane
        sheet.setColumnWidth(9, 4500);  // AMSSNUR
        sheet.setColumnWidth(10, 4500); // Prix Total
        sheet.setColumnWidth(11, 4000); // Contrôle
    }

    private void addCommonStyleProperties(CellStyle style) {
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void createReportHeader(Sheet sheet, Workbook workbook, Arrival arrival) {
        // Title
        Row titleRow = sheet.createRow(TITLE_ROW);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(String.format("CONTRÔLE DES FACTURES D'ACHAT DES PRODUITS RADIOPHARMACEUTIQUES DE %s",
                arrival.getArrivalDate().format(DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("fr"))).toUpperCase()));
        titleCell.setCellStyle(createTitleStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(TITLE_ROW, TITLE_ROW, 0, 11));

        // Metadata
        Row metadataRow = sheet.createRow(METADATA_ROW);
        Cell metadataCell = metadataRow.createCell(0);
        metadataCell.setCellValue(String.format("Généré le: %s",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
        metadataCell.setCellStyle(createMetadataStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(METADATA_ROW, METADATA_ROW, 0, 11));
    }

    private void createSupplierSection(Sheet sheet, Workbook workbook, Arrival arrival) {
        Row supplierRow = sheet.createRow(SUPPLIER_ROW);
        Cell supplierCell = supplierRow.createCell(0);
        supplierCell.setCellValue("Fournisseur: " + arrival.getSupplier().getName());
        supplierCell.setCellStyle(createSupplierStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(SUPPLIER_ROW, SUPPLIER_ROW, 0, 3));
    }

    private void createInvoiceDetails(Sheet sheet, Workbook workbook, Arrival arrival) {
        // Invoice number
        Row invoiceRow = sheet.createRow(INVOICE_ROW);
        Cell invoiceCell = invoiceRow.createCell(0);
        invoiceCell.setCellValue("Facture d'achat N°" + arrival.getInvoiceNumber());
        invoiceCell.setCellStyle(createInvoiceStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(INVOICE_ROW, INVOICE_ROW, 0, 11));

        // Arrival date
        Row dateRow = sheet.createRow(DATE_ROW);
        Cell dateCell = dateRow.createCell(0);
        dateCell.setCellValue("Date d'arrivage: " +
                arrival.getArrivalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        dateCell.setCellStyle(createDateStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(DATE_ROW, DATE_ROW, 0, 11));
    }

    private void createDataSection(Sheet sheet, Workbook workbook, Arrival arrival) {
        // Headers
        createHeaders(sheet, workbook);

        // Data rows
        int currentRow = DATA_START_ROW;
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle statusStyle = createStatusStyle(workbook);

        double totalAmount = 0;

        for (Sale sale : arrival.getSales()) {
            Row row = sheet.createRow(currentRow++);
            row.setHeight((short)-1); // Auto height

            // Product
            Cell productCell = row.createCell(0);
            productCell.setCellValue(sale.getProduct().getName());
            productCell.setCellStyle(dataStyle);

            // Expected Quantity
            Cell expectedQtyCell = row.createCell(1);
            expectedQtyCell.setCellValue(sale.getExpectedQuantity());
            expectedQtyCell.setCellStyle(numberStyle);

            // Actual Quantity
            Cell actualQtyCell = row.createCell(2);
            actualQtyCell.setCellValue(sale.getQuantity());
            actualQtyCell.setCellStyle(numberStyle);

            // Client
            Cell clientCell = row.createCell(3);
            clientCell.setCellValue(sale.getClient().getName());
            clientCell.setCellStyle(dataStyle);

            // Price Components
            Map<PriceComponentType, Float> priceComponents = sale.getPriceComponents().stream()
                    .collect(Collectors.toMap(
                            SalePriceComponent::getComponentType,
                            SalePriceComponent::getAmount
                    ));

            // Purchase Unit Price
            Cell puaCell = row.createCell(4);
            float pua = priceComponents.getOrDefault(PriceComponentType.PURCHASE_PRICE, 0f);
            puaCell.setCellValue(pua);
            puaCell.setCellStyle(numberStyle);

            // Transport
            Cell transportCell = row.createCell(5);
            float transport = priceComponents.getOrDefault(PriceComponentType.TRANSPORT, 0f);
            transportCell.setCellValue(transport);
            transportCell.setCellStyle(numberStyle);

            // Storage
            Cell storageCell = row.createCell(6);
            float storage = priceComponents.getOrDefault(PriceComponentType.STORAGE, 0f);
            storageCell.setCellValue(storage);
            storageCell.setCellStyle(numberStyle);

            // Transit
            Cell transitCell = row.createCell(7);
            float transit = priceComponents.getOrDefault(PriceComponentType.TRANSIT, 0f);
            transitCell.setCellValue(transit);
            transitCell.setCellStyle(numberStyle);

            // Customs
            Cell customsCell = row.createCell(8);
            float customs = priceComponents.getOrDefault(PriceComponentType.DUANE, 0f);
            customsCell.setCellValue(customs);
            customsCell.setCellStyle(numberStyle);

            // Insurance
            Cell insuranceCell = row.createCell(9);
            float insurance = priceComponents.getOrDefault(PriceComponentType.AMSSNUR, 0f);
            insuranceCell.setCellValue(insurance);
            insuranceCell.setCellStyle(numberStyle);

            // Total Price
            Cell totalCell = row.createCell(10);
            float lineTotal = sale.getQuantity() * (pua + transport + storage + transit + customs + insurance);
            totalCell.setCellValue(lineTotal);
            totalCell.setCellStyle(numberStyle);

            totalAmount += lineTotal;

            // Status
            Cell statusCell = row.createCell(11);
            statusCell.setCellValue(sale.getIsConform() ? "Conforme" : "Non Conforme");
            statusCell.setCellStyle(statusStyle);
        }

        // Create totals row
        createTotalsRow(sheet, workbook, currentRow, totalAmount);
    }

    private void createHeaders(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(HEADER_ROW);
        headerRow.setHeight((short)-1); // Auto height
        CellStyle headerStyle = createHeaderStyle(workbook);

        String[] headers = {
                "Les produits RP",
                "Qtées commandées",
                "Qtées livrées",
                "Le client",
                "PU ACHAT",
                "Transport",
                "Stockage",
                "Transit",
                "Douane",
                "AMSSNUR",
                "Prix Total",
                "Contrôle"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void createTotalsRow(Sheet sheet, Workbook workbook, int rowNum, double totalAmount) {
        Row totalRow = sheet.createRow(rowNum);
        totalRow.setHeight((short)-1); // Auto height
        CellStyle totalStyle = createTotalStyle(workbook);
        CellStyle totalNumberStyle = createTotalNumberStyle(workbook);

        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("TOTAL");
        totalLabelCell.setCellStyle(totalStyle);

        Cell totalAmountCell = totalRow.createCell(10);
        totalAmountCell.setCellValue(totalAmount);
        totalAmountCell.setCellStyle(totalNumberStyle);
    }

    private void createSummarySection(Sheet sheet, Workbook workbook, Arrival arrival) {
        int startRow = sheet.getLastRowNum() + 2;
        CellStyle summaryStyle = createSummaryStyle(workbook);
        CellStyle summaryNumberStyle = createSummaryNumberStyle(workbook);

        Row summaryHeaderRow = sheet.createRow(startRow++);
        summaryHeaderRow.setHeight((short)-1); // Auto height
        Cell summaryHeaderCell = summaryHeaderRow.createCell(0);
        summaryHeaderCell.setCellValue("RÉCAPITULATIF");
        summaryHeaderCell.setCellStyle(summaryStyle);
        sheet.addMergedRegion(new CellRangeAddress(startRow - 1, startRow - 1, 0, 11));

        // Add component summaries
        Map<PriceComponentType, Double> componentTotals = calculateComponentTotals(arrival);
        for (Map.Entry<PriceComponentType, Double> entry : componentTotals.entrySet()) {
            Row row = sheet.createRow(startRow++);
            row.setHeight((short)-1); // Auto height

            Cell labelCell = row.createCell(0);
            labelCell.setCellValue(formatComponentLabel(entry.getKey()));
            labelCell.setCellStyle(summaryStyle);

            Cell valueCell = row.createCell(1);
            valueCell.setCellValue(entry.getValue());
            valueCell.setCellStyle(summaryNumberStyle);
        }
    }

    private Map<PriceComponentType, Double> calculateComponentTotals(Arrival arrival) {
        return arrival.getSales().stream()
                .flatMap(sale -> sale.getPriceComponents().stream())
                .collect(Collectors.groupingBy(
                        SalePriceComponent::getComponentType,
                        Collectors.summingDouble(component ->
                                component.getAmount() * component.getSale().getQuantity())
                ));
    }

    private String formatComponentLabel(PriceComponentType componentType) {
        return switch (componentType) {
            case PURCHASE_PRICE -> "Prix d'achat";
            case TRANSPORT -> "Transport";
            case STORAGE -> "Stockage";
            case TRANSIT -> "Transit";
            case DUANE -> "Douane";
            case AMSSNUR -> "AMSSNUR";
        };
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createMetadataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createSupplierStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createInvoiceStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.CORAL.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
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

    private CellStyle createStatusStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.TAN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
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
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createTotalNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createSummaryNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }
}