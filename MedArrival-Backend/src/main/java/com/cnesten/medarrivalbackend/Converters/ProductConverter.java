package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.PriceComponentDTO;
import com.cnesten.medarrivalbackend.DTO.ProductDTO;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductConverter {
    private final ProductCategoryConverter categoryConverter;
    private final PriceComponentConverter priceComponentConverter;

    public ProductDTO toDTO(Product product, Client client) {
        if (product == null) return null;

        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setCategory(categoryConverter.toDTO(product.getCategory()));

        if (client != null) {
            List<PriceComponentDTO> effectiveComponents = product.getPriceComponents().stream()
                    .filter(pc -> pc.getClient() == null ||
                            (pc.getClient().equals(client)))
                    .map(priceComponentConverter::toDTO)
                    .collect(Collectors.toList());

            dto.setPriceComponents(effectiveComponents);
        } else {
            if (product.getPriceComponents() != null) {
                dto.setPriceComponents(product.getPriceComponents().stream()
                        .map(priceComponentConverter::toDTO)
                        .collect(Collectors.toList()));
            }
        }

        // Calculate total cost based on client
        dto.setTotalCost(product.calculateTotalCost());

        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        dto.setCreatedBy(product.getCreatedBy());
        dto.setUpdatedBy(product.getUpdatedBy());

        return dto;
    }

    // Default toDTO without client - uses default pricing
    public ProductDTO toDTO(Product product) {
        return toDTO(product, null);
    }

    public Product toEntity(ProductDTO dto) {
        if (dto == null) return null;

        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setCategory(categoryConverter.toEntity(dto.getCategory()));

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