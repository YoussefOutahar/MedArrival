package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.ProductDTO;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductConverter {
    private final PriceComponentConverter priceComponentConverter;

    public ProductDTO toDTO(Product product) {
        if (product == null) return null;

        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());

        if (product.getPriceComponents() != null) {
            dto.setPriceComponents(product.getPriceComponents().stream()
                    .map(priceComponentConverter::toDTO)
                    .collect(Collectors.toList()));
        }

        dto.setTotalCost(product.calculateTotalCost());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        dto.setCreatedBy(product.getCreatedBy());
        dto.setUpdatedBy(product.getUpdatedBy());

        return dto;
    }

    public ProductDTO toDTO(Product product, Client client) {
        if (product == null) return null;

        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());

        if (product.getPriceComponents() != null) {
            dto.setPriceComponents(product.getPriceComponents().stream()
                    .map(priceComponentConverter::toDTO)
                    .collect(Collectors.toList()));
        }

        dto.setTotalCost(product.calculateTotalCost());

        // Set available quantity if client is provided
        if (client != null) {
            dto.setAvailableQuantity(product.calculateAvailableQuantity(client));
        }

        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        dto.setCreatedBy(product.getCreatedBy());
        dto.setUpdatedBy(product.getUpdatedBy());

        return dto;
    }

    public Product toEntity(ProductDTO dto) {
        if (dto == null) return null;

        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());

        // Convert and set price components
        if (dto.getPriceComponents() != null) {
            Set<PriceComponent> priceComponents = dto.getPriceComponents().stream()
                    .map(priceComponentConverter::toEntity)
                    .collect(Collectors.toSet());
            priceComponents.forEach(pc -> pc.setProduct(product));
            product.setPriceComponents(priceComponents);
        }


        product.setCreatedAt(dto.getCreatedAt());
        product.setUpdatedAt(dto.getUpdatedAt());
        product.setCreatedBy(dto.getCreatedBy());
        product.setUpdatedBy(dto.getUpdatedBy());
        return product;
    }
}