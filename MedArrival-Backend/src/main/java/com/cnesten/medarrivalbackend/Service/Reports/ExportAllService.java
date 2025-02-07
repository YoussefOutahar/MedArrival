package com.cnesten.medarrivalbackend.Service.Reports;

import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Service.ArrivalService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportAllService {
    private final ProductPricingReportService productPricingReportService;
    private final MonthlyProductReportService monthlyProductReportService;
    private final ClientSalesForecastService clientSalesForecastService;
    private final ExcelExportService excelExportService;
    private final ArrivalService arrivalService;

    public byte[] generateExportAll(LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        try (Workbook combinedWorkbook = new XSSFWorkbook()) {
            // First, get all arrivals for the period and generate their invoice reports
            List<Arrival> arrivals = arrivalService.findByDateRange(startDate, endDate);
            for (Arrival arrival : arrivals) {
                try (ByteArrayInputStream arrivalStream = new ByteArrayInputStream(excelExportService.generateInvoiceExcel(arrival));
                     Workbook arrivalWorkbook = new XSSFWorkbook(arrivalStream)) {
                    copySheets(arrivalWorkbook, combinedWorkbook,
                            "Arrival " + arrival.getInvoiceNumber() + " - ");
                }
            }

            // Then add the other reports
            byte[] pricingReport = productPricingReportService.generatePricingReport(startDate, endDate);
            byte[] monthlyReport = monthlyProductReportService.generateMonthlyProductReport(startDate, endDate);
            byte[] forecastReport = clientSalesForecastService.generateClientSalesForecastReport(startDate, endDate);

            // Copy sheets from each report
            try (ByteArrayInputStream pricingStream = new ByteArrayInputStream(pricingReport);
                 ByteArrayInputStream monthlyStream = new ByteArrayInputStream(monthlyReport);
                 ByteArrayInputStream forecastStream = new ByteArrayInputStream(forecastReport);
                 Workbook pricingWorkbook = new XSSFWorkbook(pricingStream);
                 Workbook monthlyWorkbook = new XSSFWorkbook(monthlyStream);
                 Workbook forecastWorkbook = new XSSFWorkbook(forecastStream)) {

                copySheets(pricingWorkbook, combinedWorkbook, "Pricing - ");
                copySheets(monthlyWorkbook, combinedWorkbook, "Monthly - ");
                copySheets(forecastWorkbook, combinedWorkbook, "Forecast - ");
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            combinedWorkbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void copySheets(Workbook sourceWorkbook, Workbook targetWorkbook, String sheetPrefix) {
        for (int i = 0; i < sourceWorkbook.getNumberOfSheets(); i++) {
            Sheet sourceSheet = sourceWorkbook.getSheetAt(i);
            Sheet targetSheet = targetWorkbook.createSheet(sheetPrefix + sourceSheet.getSheetName());

            // Copy sheet properties
            targetSheet.setDisplayGridlines(sourceSheet.isDisplayGridlines());
            targetSheet.setDisplayGuts(sourceSheet.getDisplayGuts());
            targetSheet.setDisplayRowColHeadings(sourceSheet.isDisplayRowColHeadings());
            targetSheet.setDisplayZeros(sourceSheet.isDisplayZeros());
            targetSheet.setRightToLeft(sourceSheet.isRightToLeft());

            // Copy rows
            for (Row sourceRow : sourceSheet) {
                Row targetRow = targetSheet.createRow(sourceRow.getRowNum());
                copyRow(sourceRow, targetRow, targetWorkbook);
            }

            // Copy column widths
            for (int j = 0; j < sourceSheet.getPhysicalNumberOfRows(); j++) {
                targetSheet.setColumnWidth(j, sourceSheet.getColumnWidth(j));
            }

            // Copy merged regions
            for (CellRangeAddress mergedRegion : sourceSheet.getMergedRegions()) {
                targetSheet.addMergedRegion(mergedRegion);
            }
        }
    }

    private void copyRow(Row sourceRow, Row targetRow, Workbook targetWorkbook) {
        targetRow.setHeight(sourceRow.getHeight());

        for (Cell sourceCell : sourceRow) {
            Cell targetCell = targetRow.createCell(sourceCell.getColumnIndex());
            copyCellStyle(sourceCell, targetCell, targetWorkbook);
            copyCellValue(sourceCell, targetCell);
        }
    }

    private void copyCellStyle(Cell sourceCell, Cell targetCell, Workbook targetWorkbook) {
        CellStyle sourceStyle = sourceCell.getCellStyle();
        CellStyle targetStyle = targetWorkbook.createCellStyle();

        targetStyle.cloneStyleFrom(sourceStyle);
        targetCell.setCellStyle(targetStyle);
    }

    private void copyCellValue(Cell sourceCell, Cell targetCell) {
        switch (sourceCell.getCellType()) {
            case BLANK:
                targetCell.setBlank();
                break;
            case BOOLEAN:
                targetCell.setCellValue(sourceCell.getBooleanCellValue());
                break;
            case ERROR:
                targetCell.setCellErrorValue(sourceCell.getErrorCellValue());
                break;
            case FORMULA:
                targetCell.setCellFormula(sourceCell.getCellFormula());
                break;
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(sourceCell)) {
                    targetCell.setCellValue(sourceCell.getDateCellValue());
                } else {
                    targetCell.setCellValue(sourceCell.getNumericCellValue());
                }
                break;
            case STRING:
                targetCell.setCellValue(sourceCell.getRichStringCellValue());
                break;
            default:
                targetCell.setBlank();
        }
    }
}