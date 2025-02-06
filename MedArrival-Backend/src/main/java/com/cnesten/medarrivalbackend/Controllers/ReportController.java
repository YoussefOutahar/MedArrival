package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Service.Reports.ClientSalesForecastService;
import com.cnesten.medarrivalbackend.Service.Reports.ExcelExportService;
import com.cnesten.medarrivalbackend.Service.ArrivalService;
import com.cnesten.medarrivalbackend.Service.Reports.MonthlyProductReportService;
import com.cnesten.medarrivalbackend.Service.Reports.ProductPricingReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ArrivalService arrivalService;
    private final ExcelExportService excelService;
    private final ProductPricingReportService productPricingReportService;
    private final MonthlyProductReportService monthlyProductReportService;
    private final ClientSalesForecastService clientSalesForecastService;

    @GetMapping("/invoice/{invoiceNumber}/excel")
    public ResponseEntity<byte[]> generateInvoiceExcel(@PathVariable String invoiceNumber) {
        Arrival arrival = arrivalService.findByInvoiceNumber(invoiceNumber);
        byte[] excelFile = excelService.generateInvoiceExcel(arrival);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelFile);
    }

    @GetMapping("/pricing-report")
    public ResponseEntity<byte[]> generatePricingReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime endDate) {

        byte[] report = productPricingReportService.generatePricingReport(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=pricing-report-" +
                                LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(report);
    }

    @GetMapping("/monthly-product-report")
    public ResponseEntity<byte[]> generateMonthlyProductReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        byte[] report = monthlyProductReportService.generateMonthlyProductReport(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=monthly-product-report-" +
                                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")) + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(report);
    }

    @GetMapping("/client-sales-forecast")
    public ResponseEntity<byte[]> generateClientSalesForecast(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        byte[] report = clientSalesForecastService.generateClientSalesForecastReport(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=client-sales-forecast-" +
                                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")) + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(report);
    }
}