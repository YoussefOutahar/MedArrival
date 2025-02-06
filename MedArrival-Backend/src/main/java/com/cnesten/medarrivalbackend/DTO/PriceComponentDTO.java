package com.cnesten.medarrivalbackend.DTO;

import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PriceComponentDTO {
    private Long id;
    private PriceComponentType componentType;
    private Float amount;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    private ClientDTO client;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
