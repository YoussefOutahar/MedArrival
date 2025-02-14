package com.cnesten.medarrivalbackend.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class SaleDTO {
    private Long id;
    private Integer quantity;
    private Integer expectedQuantity;
    private Float totalAmount;
    private LocalDateTime saleDate;
    private LocalDateTime expectedDeliveryDate;
    private Boolean isConform;
    private ProductDTO product;
    private Set<SalePriceComponentDTO> priceComponents = new HashSet<>();
    private ClientDTO client;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}