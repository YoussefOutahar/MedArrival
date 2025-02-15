package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.ArrivalDTO;
import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Models.Sale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ArrivalConverter {
    private final SaleConverter saleConverter;
    private final SupplierConverter supplierConverter;

    public ArrivalDTO toDTO(Arrival arrival) {
        if (arrival == null) return null;

        ArrivalDTO dto = new ArrivalDTO();
        dto.setId(arrival.getId());
        dto.setArrivalDate(arrival.getArrivalDate());
        dto.setInvoiceNumber(arrival.getInvoiceNumber());
        dto.setSales(arrival.getSales().stream()
                .map(saleConverter::toDTO)
                .collect(Collectors.toSet()));
        dto.setSupplier(supplierConverter.toDTO(arrival.getSupplier()));
        dto.setCreatedAt(arrival.getCreatedAt());
        dto.setUpdatedAt(arrival.getUpdatedAt());
        dto.setCreatedBy(arrival.getCreatedBy());
        dto.setUpdatedBy(arrival.getUpdatedBy());
        return dto;
    }

    public Arrival toEntity(ArrivalDTO dto) {
        if (dto == null) return null;

        Arrival arrival = new Arrival();
        if (dto.getId() != null && dto.getId() != 0) {
            arrival.setId(dto.getId());
        }
        arrival.setArrivalDate(dto.getArrivalDate());
        arrival.setInvoiceNumber(dto.getInvoiceNumber());
        arrival.setSupplier(supplierConverter.toEntity(dto.getSupplier()));
        arrival.setCreatedAt(dto.getCreatedAt());
        arrival.setUpdatedAt(dto.getUpdatedAt());
        arrival.setCreatedBy(dto.getCreatedBy());
        arrival.setUpdatedBy(dto.getUpdatedBy());

        // Handle sales separately to manage bidirectional relationship
        Set<Sale> sales = dto.getSales().stream()
                .map(saleConverter::toEntity)
                .collect(Collectors.toSet());

        arrival.setSales(new HashSet<>()); // Initialize empty set
        sales.forEach(sale -> {
            arrival.getSales().add(sale);
            sale.getArrivals().add(arrival);
        });

        return arrival;
    }
}
