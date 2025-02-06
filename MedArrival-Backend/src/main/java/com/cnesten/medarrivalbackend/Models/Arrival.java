package com.cnesten.medarrivalbackend.Models;

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
@ToString(exclude = {"sales", "supplier"})
@EqualsAndHashCode(exclude = {"sales", "supplier"})
@Entity
@Table(name = "arrivals", indexes = {
        @Index(name = "idx_invoice_number", columnList = "invoice_number"),
        @Index(name = "idx_arrival_date", columnList = "arrival_date"),
        @Index(name = "idx_supplier", columnList = "supplier_id")
})
@EntityListeners(AuditingEntityListener.class)
public class Arrival {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "arrival_date")
    private LocalDateTime arrivalDate;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @ManyToMany
    @JoinTable(
            name = "arrival_sales",
            joinColumns = @JoinColumn(name = "arrival_id"),
            inverseJoinColumns = @JoinColumn(name = "sale_id")
    )
    private Set<Sale> sales = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

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
}
