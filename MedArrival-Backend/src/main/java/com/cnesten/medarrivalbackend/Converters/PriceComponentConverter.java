package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.PriceComponentDTO;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PriceComponentConverter {
    private final ClientConverter clientConverter;

    public PriceComponentDTO toDTO(PriceComponent priceComponent) {
        if (priceComponent == null) return null;

        PriceComponentDTO dto = new PriceComponentDTO();
        dto.setId(priceComponent.getId());
        dto.setComponentType(priceComponent.getComponentType());
        dto.setAmount(priceComponent.getAmount());
        dto.setEffectiveFrom(priceComponent.getEffectiveFrom());
        dto.setEffectiveTo(priceComponent.getEffectiveTo());

        dto.setClient(clientConverter.toDTO(priceComponent.getClient()));
        dto.setUsesDefaultPrice(priceComponent.getClient() == null);

        dto.setCreatedAt(priceComponent.getCreatedAt());
        dto.setUpdatedAt(priceComponent.getUpdatedAt());
        dto.setCreatedBy(priceComponent.getCreatedBy());
        dto.setUpdatedBy(priceComponent.getUpdatedBy());
        return dto;
    }

    public PriceComponent toEntity(PriceComponentDTO dto) {
        if (dto == null) return null;

        PriceComponent priceComponent = new PriceComponent();
        priceComponent.setId(dto.getId());
        priceComponent.setComponentType(dto.getComponentType());
        priceComponent.setAmount(dto.getAmount());
        priceComponent.setEffectiveFrom(dto.getEffectiveFrom());
        priceComponent.setEffectiveTo(dto.getEffectiveTo());

        priceComponent.setClient(clientConverter.toEntity(dto.getClient()));

        priceComponent.setCreatedAt(dto.getCreatedAt());
        priceComponent.setUpdatedAt(dto.getUpdatedAt());
        priceComponent.setCreatedBy(dto.getCreatedBy());
        priceComponent.setUpdatedBy(dto.getUpdatedBy());
        return priceComponent;
    }
}