package com.cnesten.medarrivalbackend.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ArrivalDTO {
    private Long id;
    private LocalDateTime arrivalDate;
    private String invoiceNumber;
    private Set<SaleDTO> sales;
    private SupplierDTO supplier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
