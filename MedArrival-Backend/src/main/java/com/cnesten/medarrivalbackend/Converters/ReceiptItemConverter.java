package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.ReceiptItemDTO;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReceiptItemConverter {
    private final ProductConverter productConverter;

    public ReceiptItemDTO toDTO(ReceiptItem item) {
        if (item == null) return null;

        ReceiptItemDTO dto = new ReceiptItemDTO();
        dto.setId(item.getId());
        dto.setProduct(productConverter.toDTO(item.getProduct()));
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        dto.setLotNumber(item.getLotNumber());
        dto.setCalibrationDate(item.getCalibrationDate());
        dto.setExpirationDate(item.getExpirationDate());
        dto.setArticleCode(item.getArticleCode());
        dto.setDescription(item.getDescription());
        dto.setUnit(item.getUnit());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        dto.setCreatedBy(item.getCreatedBy());
        dto.setUpdatedBy(item.getUpdatedBy());

        return dto;
    }

    public ReceiptItem toEntity(ReceiptItemDTO dto) {
        if (dto == null) return null;

        ReceiptItem item = new ReceiptItem();
        item.setId(dto.getId());
        item.setProduct(productConverter.toEntity(dto.getProduct()));
        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setSubtotal(dto.getSubtotal());
        item.setLotNumber(dto.getLotNumber());
        item.setCalibrationDate(dto.getCalibrationDate());
        item.setExpirationDate(dto.getExpirationDate());
        item.setArticleCode(dto.getArticleCode());
        item.setDescription(dto.getDescription());
        item.setUnit(dto.getUnit());
        item.setCreatedAt(dto.getCreatedAt());
        item.setUpdatedAt(dto.getUpdatedAt());
        item.setCreatedBy(dto.getCreatedBy());
        item.setUpdatedBy(dto.getUpdatedBy());

        return item;
    }
}