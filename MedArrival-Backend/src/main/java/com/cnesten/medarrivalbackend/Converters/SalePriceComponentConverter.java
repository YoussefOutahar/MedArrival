package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.SalePriceComponentDTO;
import com.cnesten.medarrivalbackend.Models.Price.SalePriceComponent;
import org.springframework.stereotype.Component;

@Component
public class SalePriceComponentConverter {

    public SalePriceComponentDTO toDTO(SalePriceComponent component) {
        if (component == null) return null;

        SalePriceComponentDTO dto = new SalePriceComponentDTO();
        dto.setId(component.getId());
        dto.setComponentType(component.getComponentType());
        dto.setAmount(component.getAmount());
        dto.setUsesDefaultPrice(component.getUsesDefaultPrice());
        dto.setCreatedAt(component.getCreatedAt());
        dto.setUpdatedAt(component.getUpdatedAt());
        dto.setCreatedBy(component.getCreatedBy());
        dto.setUpdatedBy(component.getUpdatedBy());
        return dto;
    }

    public SalePriceComponent toEntity(SalePriceComponentDTO dto) {
        if (dto == null) return null;

        SalePriceComponent component = new SalePriceComponent();
        component.setId(dto.getId());
        component.setComponentType(dto.getComponentType());
        component.setAmount(dto.getAmount());
        component.setUsesDefaultPrice(dto.getUsesDefaultPrice());
        component.setCreatedAt(dto.getCreatedAt());
        component.setUpdatedAt(dto.getUpdatedAt());
        component.setCreatedBy(dto.getCreatedBy());
        component.setUpdatedBy(dto.getUpdatedBy());
        return component;
    }
}