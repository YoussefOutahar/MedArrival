package com.cnesten.medarrivalbackend.DTO.KPI;

import lombok.Data;

@Data
public class SupplierMetricDTO {
    private Long supplierId;
    private String supplierName;
    private Integer deliveryCount;
    private Double totalValue;
    private Double onTimeDeliveryRate;
    private Integer qualityIssues;
}