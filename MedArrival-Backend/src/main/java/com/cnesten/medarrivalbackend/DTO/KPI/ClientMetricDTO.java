package com.cnesten.medarrivalbackend.DTO.KPI;

import lombok.Data;

@Data
public class ClientMetricDTO {
    private Long clientId;
    private String clientName;
    private Integer orderCount;
    private Double totalPurchases;
}