package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.SupplierDTO;
import com.cnesten.medarrivalbackend.Models.Supplier;
import org.springframework.stereotype.Component;


@Component
public class SupplierConverter {
    public SupplierDTO toDTO(Supplier supplier) {
        if (supplier == null) return null;

        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setAddress(supplier.getAddress());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        dto.setCreatedBy(supplier.getCreatedBy());
        dto.setUpdatedBy(supplier.getUpdatedBy());
        return dto;
    }

    public Supplier toEntity(SupplierDTO dto) {
        if (dto == null) return null;

        Supplier supplier = new Supplier();
        supplier.setId(dto.getId());
        supplier.setName(dto.getName());
        supplier.setAddress(dto.getAddress());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setCreatedAt(dto.getCreatedAt());
        supplier.setUpdatedAt(dto.getUpdatedAt());
        supplier.setCreatedBy(dto.getCreatedBy());
        supplier.setUpdatedBy(dto.getUpdatedBy());
        return supplier;
    }
}