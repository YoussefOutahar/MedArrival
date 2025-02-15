package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Repository.PriceComponentRepository;
import com.cnesten.medarrivalbackend.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ClientService clientService;
    private final PriceComponentRepository priceComponentRepository;

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public List<Product> findAll() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::getProductWithDefaultPricing)
                .collect(Collectors.toList());
    }

    public Page<Product> findAll(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(this::getProductWithDefaultPricing);
    }

    private Product getProductWithDefaultPricing(Product product) {
        Set<PriceComponent> defaultComponents = product.getPriceComponents().stream()
                .filter(pc -> pc.getClient() == null && pc.getEffectiveTo() == null)
                .collect(Collectors.toSet());

        Product filteredProduct = new Product();
        filteredProduct.setId(product.getId());
        filteredProduct.setName(product.getName());
        filteredProduct.setDescription(product.getDescription());
        filteredProduct.setPriceComponents(defaultComponents);
        filteredProduct.setCreatedAt(product.getCreatedAt());
        filteredProduct.setUpdatedAt(product.getUpdatedAt());
        filteredProduct.setCreatedBy(product.getCreatedBy());
        filteredProduct.setUpdatedBy(product.getUpdatedBy());

        return filteredProduct;
    }

    public Product getProductWithClientPricing(Long productId, Client client) {
        Product product = findById(productId);
        return applyClientPricing(product, client);
    }

    public Page<Product> findAllWithClientPricing(Pageable pageable, Client client) {
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(product -> applyClientPricing(product, client));
    }

    private Product applyClientPricing(Product product, Client client) {
        Set<PriceComponent> relevantComponents = new HashSet<>();

        if (client != null) {
            // Get client-specific components
            Set<PriceComponent> clientComponents = product.getPriceComponents().stream()
                    .filter(pc -> pc.getEffectiveTo() == null &&
                            pc.getClient() != null &&
                            pc.getClient().getId().equals(client.getId()))
                    .collect(Collectors.toSet());

            // Get default components for types that don't have client-specific pricing
            Set<PriceComponent> defaultComponents = product.getPriceComponents().stream()
                    .filter(pc -> pc.getEffectiveTo() == null && pc.getClient() == null)
                    .filter(defaultPc -> clientComponents.stream()
                            .noneMatch(clientPc -> clientPc.getComponentType() == defaultPc.getComponentType()))
                    .collect(Collectors.toSet());

            relevantComponents.addAll(clientComponents);
            relevantComponents.addAll(defaultComponents);
        } else {
            // For null client, get only default components
            relevantComponents = product.getPriceComponents().stream()
                    .filter(pc -> pc.getEffectiveTo() == null && pc.getClient() == null)
                    .collect(Collectors.toSet());
        }

        Product filteredProduct = new Product();
        filteredProduct.setId(product.getId());
        filteredProduct.setName(product.getName());
        filteredProduct.setDescription(product.getDescription());
        filteredProduct.setPriceComponents(relevantComponents);
        filteredProduct.setCreatedAt(product.getCreatedAt());
        filteredProduct.setUpdatedAt(product.getUpdatedAt());
        filteredProduct.setCreatedBy(product.getCreatedBy());
        filteredProduct.setUpdatedBy(product.getUpdatedBy());

        return filteredProduct;
    }

    @Transactional
    public Product save(Product product) {
        if (product.getId() != null) {
            return updateProduct(product);
        }
        return productRepository.save(product);
    }

    private Product updateProduct(Product updatedProduct) {
        Product existingProduct = productRepository.findById(updatedProduct.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Split existing components into client-specific and default ones
        Set<PriceComponent> clientSpecificComponents = existingProduct.getPriceComponents().stream()
                .filter(pc -> pc.getClient() != null)
                .collect(Collectors.toSet());

        Set<PriceComponent> defaultComponents = existingProduct.getPriceComponents().stream()
                .filter(pc -> pc.getClient() == null)
                .collect(Collectors.toSet());

        // Delete only default price components
        if (!defaultComponents.isEmpty()) {
            priceComponentRepository.deleteAll(defaultComponents);
        }

        // Set new basic properties
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());

        // Keep only active default price components from the update
        if (updatedProduct.getPriceComponents() != null) {
            Set<PriceComponent> newActiveComponents = updatedProduct.getPriceComponents().stream()
                    .filter(pc -> pc.getEffectiveTo() == null && pc.getClient() == null)
                    .map(pc -> {
                        PriceComponent newPc = new PriceComponent();
                        newPc.setComponentType(pc.getComponentType());
                        newPc.setAmount(pc.getAmount());
                        newPc.setEffectiveFrom(pc.getEffectiveFrom());
                        newPc.setEffectiveTo(null);
                        newPc.setClient(null);
                        newPc.setProduct(existingProduct);
                        return newPc;
                    })
                    .collect(Collectors.toSet());

            // Combine client-specific components with new default components
            Set<PriceComponent> allComponents = new HashSet<>();
            allComponents.addAll(clientSpecificComponents);
            allComponents.addAll(newActiveComponents);

            existingProduct.setPriceComponents(allComponents);
        }

        try {
            return productRepository.save(existingProduct);
        } catch (OptimisticLockingFailureException e) {
            throw new OptimisticLockingFailureException("Product was modified by another transaction");
        }
    }

    @Transactional
    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    public Product setCustomPricingForClient(
            Long productId,
            Long clientId,
            Map<PriceComponentType, Float> priceComponents) {

        Client client = clientService.findById(clientId);
        if (client.getClientType() != ClientType.CLIENT_MARCHER) {
            throw new IllegalStateException("Only CLIENT_MARCHER type clients can have custom pricing");
        }

        Product product = findById(productId);

        // For each price component type being updated
        priceComponents.forEach((type, amount) -> {
            // First, remove ALL existing price components of this type for this client
            product.getPriceComponents().removeIf(pc ->
                    pc.getClient() != null &&
                            pc.getClient().getId().equals(clientId) &&
                            pc.getComponentType() == type
            );

            // Then create and add the new price component
            PriceComponent priceComponent = new PriceComponent();
            priceComponent.setComponentType(type);
            priceComponent.setAmount(amount);
            priceComponent.setEffectiveFrom(LocalDateTime.now());
            priceComponent.setClient(client);
            priceComponent.setProduct(product);

            product.addPriceComponent(priceComponent);
        });

        return productRepository.save(product);
    }

    @Transactional
    public Product removeCustomPricingForClient(Long productId, Long clientId) {
        Client client = clientService.findById(clientId);
        if (client.getClientType() != ClientType.CLIENT_MARCHER) {
            throw new IllegalStateException("Only CLIENT_MARCHER type clients can have custom pricing");
        }

        Product product = findById(productId);

        // Get all price components for this client
        Set<PriceComponent> clientComponents = product.getPriceComponents().stream()
                .filter(component ->
                        component.getClient() != null &&
                                component.getClient().getId().equals(clientId))
                .collect(Collectors.toSet());

        // Remove them from the product
        product.getPriceComponents().removeAll(clientComponents);

        // Delete them from the database
        priceComponentRepository.deleteAll(clientComponents);

        // Save and refresh the product
        Product savedProduct = productRepository.save(product);
        return findById(savedProduct.getId());
    }
}
