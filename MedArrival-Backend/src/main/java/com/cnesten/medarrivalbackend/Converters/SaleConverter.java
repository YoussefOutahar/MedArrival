package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.SaleDTO;
import com.cnesten.medarrivalbackend.Models.Price.SalePriceComponent;
import com.cnesten.medarrivalbackend.Models.Sale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SaleConverter {
    private final ProductConverter productConverter;
    private final SalePriceComponentConverter priceComponentConverter;
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

        dto.setPriceComponents(sale.getPriceComponents().stream()
                .map(priceComponentConverter::toDTO)
                .collect(Collectors.toSet()));

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

        // Only set ID if not 0
        if (dto.getId() != null && dto.getId() != 0) {
            sale.setId(dto.getId());
        }

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

        // Initialize price components collection
        sale.setPriceComponents(new HashSet<>());

        // Handle price components
        if (dto.getPriceComponents() != null) {
            dto.getPriceComponents().forEach(componentDTO -> {
                SalePriceComponent component = priceComponentConverter.toEntity(componentDTO);
                // Only set ID if not 0
                if (component.getId() != null && component.getId() == 0) {
                    component.setId(null);
                }
                component.setSale(sale);
                sale.getPriceComponents().add(component);
            });
        }

        return sale;
    }
}