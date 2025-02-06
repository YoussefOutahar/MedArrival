package com.cnesten.medarrivalbackend.Models;

import com.cnesten.medarrivalbackend.Models.Client.Client;
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
@ToString(exclude = {"product", "client", "arrivals"})
@EqualsAndHashCode(exclude = {"product", "client", "arrivals"})
@Entity
@Table(name = "sales", indexes = {
        @Index(name = "idx_sales_product", columnList = "product_id"),
        @Index(name = "idx_sales_client", columnList = "client_id"),
        @Index(name = "idx_sales_sale_date", columnList = "sale_date")
})
@EntityListeners(AuditingEntityListener.class)
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "expected_quantity")
    private Integer expectedQuantity;

    @Column(name = "total_amount")
    private Float totalAmount;

    @Column(name = "sale_date")
    private LocalDateTime saleDate;

    @Column(name = "expected_delivery_date")
    private LocalDateTime expectedDeliveryDate;

    @Column(name = "is_conform")
    private Boolean isConform;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToMany(mappedBy = "sales")
    private Set<Arrival> arrivals = new HashSet<>();

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
        calculateTotalAmount();
    }

    @PreUpdate
    protected void onUpdate() {
        if (version == null) {
            version = 0L;
        }
        calculateTotalAmount();
    }

    private void calculateTotalAmount() {
        if (product != null && client != null && quantity != null) {
            Float unitPrice = product.getCurrentPriceByComponentForClient(
                    PriceComponentType.PURCHASE_PRICE,
                    client
            );
            totalAmount = unitPrice * quantity;
        }
    }
}