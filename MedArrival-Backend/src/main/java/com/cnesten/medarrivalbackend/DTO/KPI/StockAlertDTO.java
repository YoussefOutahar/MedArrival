package com.cnesten.medarrivalbackend.DTO.KPI;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockAlertDTO {
    private Long productId;
    private String productName;
    private Integer currentStock;
    private Integer minimumRequired;
    private String status; // LOW, CRITICAL, OUT_OF_STOCK
    private LocalDateTime lastRestockDate;
}