package com.cnesten.medarrivalbackend.DTO;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class ProductCategoryDTO {
    private Long id;
    private String name;
    private String description;
    private Long productCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}