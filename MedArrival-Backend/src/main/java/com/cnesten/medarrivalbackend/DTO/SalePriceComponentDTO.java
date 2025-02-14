package com.cnesten.medarrivalbackend.DTO;

import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class SalePriceComponentDTO {
    private Long id;
    private PriceComponentType componentType;
    private Float amount;
    private Boolean usesDefaultPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}