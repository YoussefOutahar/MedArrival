package com.cnesten.medarrivalbackend.Models.Receipts;

import com.cnesten.medarrivalbackend.Models.Product;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@ToString(exclude = {"receipt", "product"})
@EqualsAndHashCode(exclude = {"receipt", "product"})
@Table(name = "receipt_items")
@EntityListeners(AuditingEntityListener.class)
public class ReceiptItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id")
    private Receipt receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price")
    private Float unitPrice;

    @Column(name = "subtotal")
    private Float subtotal;

    @Column(name = "lot_number")
    private String lotNumber; // "Lot" in delivery notes

    @Column(name = "calibration_date")
    private LocalDateTime calibrationDate;  // "Date Calibration"

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;  // "Date Péremption"

    @Column(name = "article_code")
    private String articleCode;  // "AGE0124", etc.

    @Column(name = "description")
    private String description;  // Full product description

    @Column(name = "unit")
    private String unit;

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
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @PrePersist
    protected void onCreate() {
        if (version == null) {
            version = 0L;
        }
        calculateSubtotal();
    }

    @PreUpdate
    protected void onUpdate() {
        if (version == null) {
            version = 0L;
        }
        calculateSubtotal();
    }

    private void calculateSubtotal() {
        if (quantity != null && unitPrice != null) {
            this.subtotal = quantity * unitPrice;
        }
    }
}
