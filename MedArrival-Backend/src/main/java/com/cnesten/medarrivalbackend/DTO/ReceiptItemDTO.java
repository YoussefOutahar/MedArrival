package com.cnesten.medarrivalbackend.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReceiptItemDTO {
    private Long id;
    private ProductDTO product;
    private Integer quantity;
    private Float unitPrice;
    private Float subtotal;
    private String lotNumber;
    private LocalDateTime calibrationDate;
    private LocalDateTime expirationDate;
    private String articleCode;
    private String description;
    private String unit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
