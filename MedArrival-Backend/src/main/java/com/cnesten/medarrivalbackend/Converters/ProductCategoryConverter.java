package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.ProductCategoryDTO;
import com.cnesten.medarrivalbackend.Models.ProductCategory;
import com.cnesten.medarrivalbackend.Repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ProductCategoryConverter {
    private final ProductCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public ProductCategoryDTO toDTO(ProductCategory category) {
        if (category == null) return null;

        ProductCategoryDTO dto = new ProductCategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setProductCount(categoryRepository.countByCategoryId(category.getId()));
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setCreatedBy(category.getCreatedBy());
        dto.setUpdatedBy(category.getUpdatedBy());
        return dto;
    }

    public ProductCategory toEntity(ProductCategoryDTO dto) {
        if (dto == null) return null;

        ProductCategory category = new ProductCategory();
        category.setId(dto.getId());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setCreatedAt(dto.getCreatedAt());
        category.setUpdatedAt(dto.getUpdatedAt());
        category.setCreatedBy(dto.getCreatedBy());
        category.setUpdatedBy(dto.getUpdatedBy());
        return category;
    }
}