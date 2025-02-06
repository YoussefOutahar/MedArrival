package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.SaleDTO;
import com.cnesten.medarrivalbackend.Models.Sale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SaleConverter {
    private final ProductConverter productConverter;
    private final ClientConverter clientConverter;

    public SaleDTO toDTO(Sale sale) {
        if (sale == null) return null;

        SaleDTO dto = new SaleDTO();
        dto.setId(sale.getId());
        dto.setQuantity(sale.getQuantity());
        dto.setExpectedQuantity(sale.getExpectedQuantity());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setSaleDate(sale.getSaleDate());
        dto.setExpectedDeliveryDate(sale.getExpectedDeliveryDate());
        dto.setIsConform(sale.getIsConform());
        dto.setProduct(productConverter.toDTO(sale.getProduct()));
        dto.setClient(clientConverter.toDTO(sale.getClient()));
        dto.setCreatedAt(sale.getCreatedAt());
        dto.setUpdatedAt(sale.getUpdatedAt());
        dto.setCreatedBy(sale.getCreatedBy());
        dto.setUpdatedBy(sale.getUpdatedBy());
        return dto;
    }

    public Sale toEntity(SaleDTO dto) {
        if (dto == null) return null;

        Sale sale = new Sale();
        sale.setId(dto.getId());
        sale.setQuantity(dto.getQuantity());
        sale.setExpectedQuantity(dto.getExpectedQuantity());
        sale.setTotalAmount(dto.getTotalAmount());
        sale.setSaleDate(dto.getSaleDate());
        sale.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        sale.setIsConform(dto.getIsConform());
        sale.setProduct(productConverter.toEntity(dto.getProduct()));
        sale.setClient(clientConverter.toEntity(dto.getClient()));
        sale.setCreatedAt(dto.getCreatedAt());
        sale.setUpdatedAt(dto.getUpdatedAt());
        sale.setCreatedBy(dto.getCreatedBy());
        sale.setUpdatedBy(dto.getUpdatedBy());
        return sale;
    }
}