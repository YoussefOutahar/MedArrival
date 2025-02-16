package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Price.SalePriceComponent;
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
    private static final int TITLE_ROW = 0;
    private static final int HEADER_ROW = 1;
    private static final int DATA_START_ROW = 2;

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
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Récapitulatif Facturation");

            setupColumns(sheet);
            createTitle(sheet, workbook, startDate);
            createHeaders(sheet, workbook);
            fillData(sheet, workbook, arrivals, specificClient);

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
            throw new RuntimeException("Failed to generate receipt report", e);
        }
    }

    private void setupColumns(Sheet sheet) {
        sheet.setColumnWidth(0, 6000);  // Le client
        sheet.setColumnWidth(1, 8000);  // Le produit RP
        sheet.setColumnWidth(2, 4500);  // Qtée commandé
        sheet.setColumnWidth(3, 4500);  // Qtée livrée
        sheet.setColumnWidth(4, 4500);  // Prix Unitaire de vente
        sheet.setColumnWidth(5, 4500);  // PU de vente selon la G
        sheet.setColumnWidth(6, 4500);  // Contrôle
        sheet.setColumnWidth(7, 4500);  // Mt Total Fact
        sheet.setColumnWidth(8, 4500);  // N°de Facture de Vente
        sheet.setColumnWidth(9, 4500);  // Ecart
        sheet.setColumnWidth(10, 8000); // Justification des écarts
        sheet.setColumnWidth(11, 8000); // Remarques
    }

    private void addCommonStyleProperties(CellStyle style) {
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void createTitle(Sheet sheet, Workbook workbook, LocalDateTime startDate) {
        Row titleRow = sheet.createRow(TITLE_ROW);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("fr"));
        titleCell.setCellValue("TABLEAU RECAPITULATIF DE FACTURATION POUR " +
                startDate.format(monthFormatter).toUpperCase());

        titleCell.setCellStyle(createTitleStyle(workbook));
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 11));
    }

    private void createHeaders(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(HEADER_ROW);
        headerRow.setHeight((short)-1);
        CellStyle headerStyle = createHeaderStyle(workbook);

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

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void fillData(Sheet sheet, Workbook workbook, List<Arrival> arrivals, Client specificClient) {
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle nonConformStyle = createNonConformStyle(workbook);
        CellStyle conformStyle = createConformStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        int rowNum = DATA_START_ROW;
        for (Arrival arrival : arrivals) {
            for (Sale sale : arrival.getSales()) {
                if (specificClient == null || sale.getClient().getId().equals(specificClient.getId())) {
                    Row row = sheet.createRow(rowNum++);
                    row.setHeight((short)-1);
                    fillDataRow(row, sale, arrival, dataStyle, numberStyle, conformStyle, nonConformStyle);
                }
            }
        }
    }

    private void fillDataRow(Row row, Sale sale, Arrival arrival,
                             CellStyle dataStyle, CellStyle numberStyle,
                             CellStyle conformStyle, CellStyle nonConformStyle) {

        // Client name
        Cell clientCell = row.createCell(0);
        clientCell.setCellValue(sale.getClient().getName());
        clientCell.setCellStyle(dataStyle);

        // Product name
        Cell productCell = row.createCell(1);
        String productName = sale.getProduct() != null ? sale.getProduct().getName() : "Produit inconnu";
        productCell.setCellValue(productName);
        productCell.setCellStyle(dataStyle);

        // Expected quantity
        Cell expectedQtyCell = row.createCell(2);
        expectedQtyCell.setCellValue(sale.getExpectedQuantity());
        expectedQtyCell.setCellStyle(numberStyle);

        // Actual quantity
        Cell actualQtyCell = row.createCell(3);
        actualQtyCell.setCellValue(sale.getQuantity());
        actualQtyCell.setCellStyle(numberStyle);

        // Calculate unit prices
        float saleUnitPrice = sale.getPriceComponents().stream()
                .filter(pc -> pc.getComponentType() == PriceComponentType.PURCHASE_PRICE)
                .findFirst()
                .map(SalePriceComponent::getAmount)
                .orElse(0f);

        // Unit price
        Cell unitPriceCell = row.createCell(4);
        unitPriceCell.setCellValue(saleUnitPrice);
        unitPriceCell.setCellStyle(numberStyle);

        // Reference price
        Cell refPriceCell = row.createCell(5);
        refPriceCell.setCellValue(saleUnitPrice);
        refPriceCell.setCellStyle(numberStyle);

        // Control status
        Cell controlCell = row.createCell(6);
        boolean productExists = sale.getProduct() != null;
        controlCell.setCellValue(productExists ? "conforme" : "non conforme");
        controlCell.setCellStyle(productExists ? conformStyle : nonConformStyle);

        // Total amount
        Cell totalCell = row.createCell(7);
        totalCell.setCellValue(sale.getTotalAmount());
        totalCell.setCellStyle(numberStyle);

        // Invoice number
        Cell invoiceCell = row.createCell(8);
        invoiceCell.setCellValue("Facture N°" + arrival.getInvoiceNumber());
        invoiceCell.setCellStyle(dataStyle);

        // Price difference
        Cell diffCell = row.createCell(9);
        diffCell.setCellValue(0);
        diffCell.setCellStyle(numberStyle);

        // Explanation for non-conforming entries
        if (!productExists) {
            Cell explanationCell = row.createCell(10);
            explanationCell.setCellValue("Produit non trouvé dans le système");
            explanationCell.setCellStyle(dataStyle);
        }
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.CORAL.getIndex());
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

    private CellStyle createNonConformStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }

    private CellStyle createConformStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addCommonStyleProperties(style);
        return style;
    }
}