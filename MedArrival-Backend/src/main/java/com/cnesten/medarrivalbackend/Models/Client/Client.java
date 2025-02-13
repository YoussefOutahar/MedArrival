package com.cnesten.medarrivalbackend.Models.Client;

import com.cnesten.medarrivalbackend.Models.Receipts.Receipt;
import com.cnesten.medarrivalbackend.Models.Sale;
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
@ToString(exclude = {"sales", "receipts"})
@EqualsAndHashCode(exclude = {"sales", "receipts"})
@Entity
@Table(name = "clients", indexes = {
        @Index(name = "idx_client_type", columnList = "client_type"),
        @Index(name = "idx_address", columnList = "address")
})
@EntityListeners(AuditingEntityListener.class)
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "client_type")
    private ClientType clientType;

    @OneToMany(mappedBy = "client")
    private Set<Sale> sales = new HashSet<>();

    @OneToMany(mappedBy = "client")
    private Set<Receipt> receipts = new HashSet<>();

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
