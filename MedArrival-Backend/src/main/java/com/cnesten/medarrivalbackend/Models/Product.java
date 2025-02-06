package com.cnesten.medarrivalbackend.Models;

import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString(exclude = {"category", "sales", "priceComponents"})
@EqualsAndHashCode(exclude = {"category", "sales", "priceComponents"})
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "name"),
        @Index(name = "idx_category", columnList = "category_id")
})
@EntityListeners(AuditingEntityListener.class)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private Set<Sale> sales = new HashSet<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<PriceComponent> priceComponents = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @Version
    private Long version = 0L;

    @PrePersist
    protected void onCreate() {
        if (version == null) {
            version = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (version == null) {
            version = 0L;
        }
    }

    public void addPriceComponent(PriceComponent priceComponent) {
        if (priceComponents == null) {
            priceComponents = new HashSet<>();
        }
        priceComponents.add(priceComponent);
        priceComponent.setProduct(this);
    }

    public void removePriceComponentsForClient(Client client) {
        priceComponents.removeIf(component ->
                component.getClient() != null &&
                        component.getClient().equals(client));
    }

    public Float getCurrentPriceByComponent(PriceComponentType componentType) {
        LocalDateTime now = LocalDateTime.now();
        return priceComponents.stream()
                .filter(pc -> pc.getComponentType() == componentType)
                .filter(pc -> !pc.getEffectiveFrom().isAfter(now))
                .filter(pc -> pc.getEffectiveTo() == null || pc.getEffectiveTo().isAfter(now))
                .findFirst()
                .map(PriceComponent::getAmount)
                .orElse(0.0f);
    }

    public Float getCurrentPriceByComponentForClient(PriceComponentType componentType, Client client) {
        LocalDateTime now = LocalDateTime.now();

        // If client is CLIENT_RP, return default price
        if (client.getClientType() == ClientType.CLIENT_RP) {
            return getCurrentPriceByComponent(componentType);
        }

        // For CLIENT_MARCHER, first try to find client-specific price
        Float clientPrice = priceComponents.stream()
                .filter(pc -> pc.getClient() != null && pc.getClient().equals(client))
                .filter(pc -> pc.getComponentType() == componentType)
                .filter(pc -> !pc.getEffectiveFrom().isAfter(now))
                .filter(pc -> pc.getEffectiveTo() == null || pc.getEffectiveTo().isAfter(now))
                .findFirst()
                .map(PriceComponent::getAmount)
                .orElse(null);

        // If no client-specific price found, return default price
        return clientPrice != null ? clientPrice : getCurrentPriceByComponent(componentType);
    }

    public Float calculateTotalCost() {
        return getCurrentPriceByComponent(PriceComponentType.PURCHASE_PRICE) +
                getCurrentPriceByComponent(PriceComponentType.AMSSNUR) +
                getCurrentPriceByComponent(PriceComponentType.STORAGE) +
                getCurrentPriceByComponent(PriceComponentType.TRANSIT) +
                getCurrentPriceByComponent(PriceComponentType.DUANE) +
                getCurrentPriceByComponent(PriceComponentType.TRANSPORT);
    }

    public Float calculateTotalCostForClient(Client client) {
        return getCurrentPriceByComponentForClient(PriceComponentType.PURCHASE_PRICE, client) +
                getCurrentPriceByComponentForClient(PriceComponentType.AMSSNUR, client) +
                getCurrentPriceByComponentForClient(PriceComponentType.STORAGE, client) +
                getCurrentPriceByComponentForClient(PriceComponentType.TRANSIT, client) +
                getCurrentPriceByComponentForClient(PriceComponentType.DUANE, client) +
                getCurrentPriceByComponentForClient(PriceComponentType.TRANSPORT, client);
    }

}