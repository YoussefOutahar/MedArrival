package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Repository.ArrivalRepository;
import com.cnesten.medarrivalbackend.Repository.ClientRepository;
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
public class ReceiptReportService {
    private final ArrivalRepository arrivalRepository;
    private final ClientRepository clientRepository;

    public byte[] generateReceiptReport(Long clientId, LocalDateTime startDate, LocalDateTime endDate) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        List<Arrival> arrivals = arrivalRepository.findByArrivalDateBetweenAndSales_Client_Id(
                startDate, endDate, clientId);

        return generateExcelReport(arrivals, client, startDate);
    }

    public byte[] generateReceiptReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Arrival> arrivals = arrivalRepository.findByArrivalDateBetween(startDate, endDate);
        return generateExcelReport(arrivals, null, startDate);
    }

    private byte[] generateExcelReport(List<Arrival> arrivals, Client specificClient, LocalDateTime startDate) {
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Récapitulatif Facturation");

            // Set column widths
            sheet.setColumnWidth(0, 5000);  // Le client
            sheet.setColumnWidth(1, 6000);  // Le produit RP
            sheet.setColumnWidth(2, 3000);  // Qtée commandé
            sheet.setColumnWidth(3, 3000);  // Qtée livrée
            sheet.setColumnWidth(4, 4000);  // Prix Unitaire de vente
            sheet.setColumnWidth(5, 4000);  // PU de vente selon la G
            sheet.setColumnWidth(6, 3000);  // Contrôle
            sheet.setColumnWidth(7, 4000);  // Mt Total Fact
            sheet.setColumnWidth(8, 4000);  // N°de Facture de Vente
            sheet.setColumnWidth(9, 3000);  // Ecart
            sheet.setColumnWidth(10, 6000); // Justification des écarts
            sheet.setColumnWidth(11, 6000); // Remarques

            // Create title
            createTitle(sheet, workbook, startDate);

            // Create headers
            createHeaders(sheet, workbook);

            // Fill data
            int rowNum = 2;
            for (Arrival arrival : arrivals) {
                for (Sale sale : arrival.getSales()) {
                    if (specificClient == null || sale.getClient().getId().equals(specificClient.getId())) {
                        Row row = sheet.createRow(rowNum++);
                        fillDataRow(row, workbook, sale, arrival);
                    }
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate receipt report", e);
        }
    }

    private void createTitle(Sheet sheet, Workbook workbook, LocalDateTime startDate) {
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("fr"));
        titleCell.setCellValue("TABLEAU RECAPITULATIF DE FACTURATION POUR " + startDate.format(monthFormatter).toUpperCase());

        CellStyle titleStyle = workbook.createCellStyle();
        titleStyle.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
        titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);

        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 11));
    }

    private void createHeaders(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(1);
        String[] headers = {
                "Le client",
                "Le produit RP",
                "Qtée commandé",
                "Qtée livrée",
                "Prix Unitaire de vente",
                "PU de vente selon la G",
                "Contrôle",
                "Mt Total Fact",
                "N°de Facture de Vente",
                "Ecart",
                "Justification des écarts",
                "Remarques"
        };

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.CORAL.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(headerFont);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void fillDataRow(Row row, Workbook workbook, Sale sale, Arrival arrival) {
        CellStyle numberStyle = workbook.createCellStyle();
        numberStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));

        CellStyle nonConformStyle = workbook.createCellStyle();
        nonConformStyle.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        nonConformStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font nonConformFont = workbook.createFont();
        nonConformFont.setBold(true);
        nonConformStyle.setFont(nonConformFont);

        CellStyle conformStyle = workbook.createCellStyle();
        conformStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        conformStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Client name
        row.createCell(0).setCellValue(sale.getClient().getName());

        // Product name
        String productName = sale.getProduct() != null ? sale.getProduct().getName() : "Produit inconnu";
        row.createCell(1).setCellValue(productName);

        // Expected quantity
        row.createCell(2).setCellValue(sale.getExpectedQuantity());

        // Actual quantity
        row.createCell(3).setCellValue(sale.getQuantity());

        // Calculate unit prices
        float saleUnitPrice = sale.getTotalAmount() / sale.getQuantity();
        float expectedUnitPrice = 0;
        if (sale.getProduct() != null) {
            expectedUnitPrice = sale.getProduct().getCurrentPriceByComponentForClient(
                    PriceComponentType.PURCHASE_PRICE,
                    sale.getClient()
            );
        }

        // Unit price
        Cell unitPriceCell = row.createCell(4);
        unitPriceCell.setCellValue(saleUnitPrice);
        unitPriceCell.setCellStyle(numberStyle);

        // Reference price
        Cell refPriceCell = row.createCell(5);
        refPriceCell.setCellValue(expectedUnitPrice);
        refPriceCell.setCellStyle(numberStyle);

        // Control status
        Cell controlCell = row.createCell(6);
        boolean priceMatches = Math.abs(saleUnitPrice - expectedUnitPrice) < 0.01;
        boolean productExists = sale.getProduct() != null;

        if (!productExists || !priceMatches) {
            controlCell.setCellValue("non conforme");
            controlCell.setCellStyle(nonConformStyle);
        } else {
            controlCell.setCellValue("conforme");
            controlCell.setCellStyle(conformStyle);
        }

        // Total amount
        Cell totalCell = row.createCell(7);
        totalCell.setCellValue(sale.getTotalAmount());
        totalCell.setCellStyle(numberStyle);

        // Invoice number
        row.createCell(8).setCellValue("Facture N°" + arrival.getInvoiceNumber());

        // Price difference
        Cell diffCell = row.createCell(9);
        float difference = saleUnitPrice - expectedUnitPrice;
        diffCell.setCellValue(difference);
        diffCell.setCellStyle(numberStyle);

        // Add explanation for non-conforming entries
        if (!productExists || !priceMatches) {
            StringBuilder explanation = new StringBuilder();
            if (!productExists) {
                explanation.append("Produit non trouvé dans le système");
            }
            if (!priceMatches) {
                if (!explanation.isEmpty()) explanation.append("; ");
                explanation.append(String.format("Écart de prix: %.2f", difference));
            }
            row.createCell(10).setCellValue(explanation.toString());
        }
    }
}