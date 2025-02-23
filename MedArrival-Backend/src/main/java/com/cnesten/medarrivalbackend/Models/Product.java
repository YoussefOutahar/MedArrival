package com.cnesten.medarrivalbackend.Models;

import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptItem;
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
import java.util.stream.Collectors;

@Getter
@Setter
@ToString(exclude = {"sales", "priceComponents", "receiptItems"})
@EqualsAndHashCode(exclude = {"sales", "priceComponents", "receiptItems"})
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "name"),
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

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private Set<ReceiptItem> receiptItems = new HashSet<>();

    @Transient
    public Integer calculateAvailableQuantity(Client client) {
        int totalSoldQuantity = this.sales.stream()
                .filter(sale -> sale.getClient().equals(client))
                .mapToInt(Sale::getQuantity)
                .sum();

        int totalReceivedQuantity = client.getReceipts().stream()
                .flatMap(receipt -> receipt.getReceiptItems().stream())
                .filter(item -> item.getProduct().equals(this))
                .mapToInt(ReceiptItem::getQuantity)
                .sum();

        return totalSoldQuantity - totalReceivedQuantity;
    }

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
        Set<PriceComponent> toRemove = priceComponents.stream()
                .filter(component ->
                        component.getClient() != null &&
                                component.getClient().equals(client))
                .collect(Collectors.toSet());

        priceComponents.removeAll(toRemove);
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