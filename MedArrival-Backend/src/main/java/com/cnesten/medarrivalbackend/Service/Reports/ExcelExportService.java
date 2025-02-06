package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Sale;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    public byte[] generateInvoiceExcel(Arrival arrival) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Invoice Control");

            // Set column widths
            setColumnWidths(sheet);

            // Create title
            createTitle(sheet, workbook, arrival);

            // Create supplier info
            createSupplierInfo(sheet, workbook, arrival);

            // Create invoice number
            createInvoiceNumber(sheet, workbook, arrival);

            // Create arrival date
            createArrivalDate(sheet, workbook, arrival);

            // Create header row
            createHeaders(sheet, workbook);

            // Fill data
            fillData(sheet, workbook, arrival);

            // Create totals
            createTotals(sheet, workbook, arrival);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    private void setColumnWidths(Sheet sheet) {
        sheet.setColumnWidth(0, 6000);  // Les produits RP
        sheet.setColumnWidth(1, 2500);  // Quantités
        sheet.setColumnWidth(2, 4000);  // Le client
        sheet.setColumnWidth(3, 6000);  // La commande
        sheet.setColumnWidth(4, 2000);  // Quantité
        sheet.setColumnWidth(5, 3000);  // PU ACHAT
        sheet.setColumnWidth(6, 3500);  // PUA de Référence
        sheet.setColumnWidth(7, 2500);  // Contrôle
        sheet.setColumnWidth(8, 3000);  // Prix d'Achat
    }

    private CellStyle createBaseStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = createBaseStyle(workbook);
        Font font = workbook.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 12);
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private void createTitle(Sheet sheet, Workbook workbook, Arrival arrival) {
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Contrôle des factures Achat des produits radiopharmaceutiques de" +
                arrival.getArrivalDate().format(DateTimeFormatter.ofPattern("MMMM yyyy")));
        titleCell.setCellStyle(createTitleStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));
    }

    private void createSupplierInfo(Sheet sheet, Workbook workbook, Arrival arrival) {
        Row supplierRow = sheet.createRow(2);
        Cell supplierCell = supplierRow.createCell(0);

        CellStyle supplierStyle = createBaseStyle(workbook);
        supplierStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        supplierStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        supplierCell.setCellValue("Fournisseur: " + arrival.getSupplier().getName());
        supplierCell.setCellStyle(supplierStyle);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 2));
    }

    private void createInvoiceNumber(Sheet sheet, Workbook workbook, Arrival arrival) {
        Row invoiceRow = sheet.createRow(4);
        Cell invoiceCell = invoiceRow.createCell(0);

        CellStyle invoiceStyle = createBaseStyle(workbook);
        invoiceStyle.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        invoiceStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        invoiceCell.setCellValue("Facture d'achat N°" + arrival.getInvoiceNumber());
        invoiceCell.setCellStyle(invoiceStyle);
        sheet.addMergedRegion(new CellRangeAddress(4, 4, 0, 8));
    }

    private void createArrivalDate(Sheet sheet, Workbook workbook, Arrival arrival) {
        Row dateRow = sheet.createRow(5);
        Cell dateCell = dateRow.createCell(0);

        CellStyle dateStyle = createBaseStyle(workbook);
        dateStyle.setFillForegroundColor(IndexedColors.CORAL.getIndex());
        dateStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        dateCell.setCellValue("Le quatrième arrivage: " +
                arrival.getArrivalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        dateCell.setCellStyle(dateStyle);
        sheet.addMergedRegion(new CellRangeAddress(5, 5, 0, 6));
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 11);
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = createBaseStyle(workbook);
        Font font = workbook.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 11);
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private void createHeaders(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(7);
        CellStyle headerStyle = createHeaderStyle(workbook);

        String[] headers = {
                "Les produits RP", "Quantités", "Le client", "La commande",
                "Quantité", "PU ACHAT", "PUA de Référence", "Contrôle", "Prix d'Achat"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = createBaseStyle(workbook);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createQuantityStyle(Workbook workbook) {
        CellStyle style = createBaseStyle(workbook);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createConformeStyle(Workbook workbook) {
        CellStyle style = createBaseStyle(workbook);
        style.setFillForegroundColor(IndexedColors.TAN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private void fillData(Sheet sheet, Workbook workbook, Arrival arrival) {
        int rowNum = 8;
        int totalQuantity = 0;
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle quantityStyle = createQuantityStyle(workbook);
        CellStyle conformeStyle = createConformeStyle(workbook);
        CellStyle baseStyle = createBaseStyle(workbook);

        for (Sale sale : arrival.getSales()) {
            Row row = sheet.createRow(rowNum++);

            // Product name
            Cell productCell = row.createCell(0);
            productCell.setCellValue(sale.getProduct().getName());
            productCell.setCellStyle(baseStyle);

            // Quantity
            Cell quantityCell = row.createCell(1);
            quantityCell.setCellValue(sale.getQuantity());
            quantityCell.setCellStyle(quantityStyle);
            totalQuantity += sale.getQuantity();

            // Client name
            Cell clientCell = row.createCell(2);
            clientCell.setCellValue(sale.getClient().getName());
            clientCell.setCellStyle(baseStyle);

            // Order (Product name)
            Cell orderCell = row.createCell(3);
            orderCell.setCellValue(sale.getProduct().getName());
            orderCell.setCellStyle(baseStyle);

            // Order quantity
            Cell orderQuantityCell = row.createCell(4);
            orderQuantityCell.setCellValue(sale.getQuantity());
            orderQuantityCell.setCellStyle(quantityStyle);

            // Purchase price (client-specific)
            Cell purchasePrice = row.createCell(5);
            purchasePrice.setCellValue(sale.getProduct().getCurrentPriceByComponentForClient(
                    PriceComponentType.PURCHASE_PRICE,
                    sale.getClient()
            ));
            purchasePrice.setCellStyle(numberStyle);

            // Reference price (default price)
            Cell referencePrice = row.createCell(6);
            referencePrice.setCellValue(sale.getProduct().getCurrentPriceByComponent(
                    PriceComponentType.PURCHASE_PRICE
            ));
            referencePrice.setCellStyle(numberStyle);

            // Control status
            Cell controle = row.createCell(7);
            controle.setCellValue(sale.getIsConform() ? "Conforme" : "Non Conforme");
            controle.setCellStyle(conformeStyle);

            // Final price (quantity * client-specific price)
            Cell finalPrice = row.createCell(8);
            finalPrice.setCellValue(sale.getTotalAmount());
            finalPrice.setCellStyle(numberStyle);
        }

        // Add quantity totals
        Row totalRow = sheet.createRow(rowNum);
        Cell totalQuantityCell = totalRow.createCell(1);
        totalQuantityCell.setCellValue(totalQuantity);

        CellStyle totalQuantityStyle = createQuantityStyle(workbook);
        totalQuantityStyle.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        totalQuantityStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        totalQuantityCell.setCellStyle(totalQuantityStyle);

        Cell totalOrderQuantityCell = totalRow.createCell(4);
        totalOrderQuantityCell.setCellValue(totalQuantity);
        totalOrderQuantityCell.setCellStyle(totalQuantityStyle);
    }

    private double calculateSubtotal(Arrival arrival) {
        return arrival.getSales().stream()
                .mapToDouble(Sale::getTotalAmount)
                .sum();
    }

    private double calculateComponentTotal(Arrival arrival, PriceComponentType componentType) {
        return arrival.getSales().stream()
                .mapToDouble(s -> {
                    float price = s.getProduct().getCurrentPriceByComponentForClient(componentType, s.getClient());
                    return price * s.getQuantity();
                })
                .sum();
    }

    private double calculateTransport(Arrival arrival) {
        return calculateComponentTotal(arrival, PriceComponentType.TRANSPORT);
    }

    private double calculateStorage(Arrival arrival) {
        return calculateComponentTotal(arrival, PriceComponentType.STORAGE);
    }

    private double calculateTransit(Arrival arrival) {
        return calculateComponentTotal(arrival, PriceComponentType.TRANSIT);
    }

    private double calculateCustoms(Arrival arrival) {
        return calculateComponentTotal(arrival, PriceComponentType.DUANE);
    }

    private double calculateInsurance(Arrival arrival) {
        return calculateComponentTotal(arrival, PriceComponentType.AMSSNUR);
    }

    private void createTotals(Sheet sheet, Workbook workbook, Arrival arrival) {
        int lastRow = sheet.getLastRowNum();
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle totalStyle = createTotalStyle(workbook);

        // Subtotal
        Row subtotalRow = sheet.createRow(lastRow + 1);
        Cell subtotalLabel = subtotalRow.createCell(7);
        subtotalLabel.setCellValue("Sous-total");
        subtotalLabel.setCellStyle(createBaseStyle(workbook));

        Cell subtotalValue = subtotalRow.createCell(8);
        subtotalValue.setCellValue(calculateSubtotal(arrival));
        subtotalValue.setCellStyle(numberStyle);

        // Transport
        Row transportRow = sheet.createRow(lastRow + 2);
        Cell transportLabel = transportRow.createCell(7);
        transportLabel.setCellValue("Transport");
        transportLabel.setCellStyle(totalStyle);

        Cell transportValue = transportRow.createCell(8);
        transportValue.setCellValue(calculateTransport(arrival));
        transportValue.setCellStyle(numberStyle);

        // Storage
        Row storageRow = sheet.createRow(lastRow + 3);
        Cell storageLabel = storageRow.createCell(7);
        storageLabel.setCellValue("Storage");
        storageLabel.setCellStyle(totalStyle);

        Cell storageValue = storageRow.createCell(8);
        storageValue.setCellValue(calculateStorage(arrival));
        storageValue.setCellStyle(numberStyle);

        // Transit
        Row transitRow = sheet.createRow(lastRow + 4);
        Cell transitLabel = transitRow.createCell(7);
        transitLabel.setCellValue("Transit");
        transitLabel.setCellStyle(totalStyle);

        Cell transitValue = transitRow.createCell(8);
        transitValue.setCellValue(calculateTransit(arrival));
        transitValue.setCellStyle(numberStyle);

        // Customs
        Row customsRow = sheet.createRow(lastRow + 5);
        Cell customsLabel = customsRow.createCell(7);
        customsLabel.setCellValue("Customs");
        customsLabel.setCellStyle(totalStyle);

        Cell customsValue = customsRow.createCell(8);
        customsValue.setCellValue(calculateCustoms(arrival));
        customsValue.setCellStyle(numberStyle);

        // Insurance
        Row insuranceRow = sheet.createRow(lastRow + 6);
        Cell insuranceLabel = insuranceRow.createCell(7);
        insuranceLabel.setCellValue("Insurance");
        insuranceLabel.setCellStyle(totalStyle);

        Cell insuranceValue = insuranceRow.createCell(8);
        insuranceValue.setCellValue(calculateInsurance(arrival));
        insuranceValue.setCellStyle(numberStyle);

        // Total
        Row totalRow = sheet.createRow(lastRow + 7);
        Cell totalLabel = totalRow.createCell(7);
        totalLabel.setCellValue("Total");
        totalLabel.setCellStyle(totalStyle);

        Cell totalValue = totalRow.createCell(8);
        double total = calculateSubtotal(arrival) +
                calculateTransport(arrival) +
                calculateStorage(arrival) +
                calculateTransit(arrival) +
                calculateCustoms(arrival) +
                calculateInsurance(arrival);
        totalValue.setCellValue(total);
        totalValue.setCellStyle(numberStyle);
    }
}