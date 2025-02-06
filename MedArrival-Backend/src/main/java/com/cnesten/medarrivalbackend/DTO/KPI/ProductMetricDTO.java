package com.cnesten.medarrivalbackend.DTO.KPI;

import lombok.Data;

@Data
public class ProductMetricDTO {
    private Long productId;
    private String productName;
    private Integer salesCount;
    private Double revenue;
}
