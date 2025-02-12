package com.cnesten.medarrivalbackend.Models.Receipts;

import com.cnesten.medarrivalbackend.Models.Client.Client;
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
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString(exclude = {"client", "receiptItems"})
@EqualsAndHashCode(exclude = {"client", "receiptItems"})
@Entity
@Table(name = "receipts", indexes = {
        @Index(name = "idx_receipt_number", columnList = "receipt_number"),
        @Index(name = "idx_receipt_date", columnList = "receipt_date"),
        @Index(name = "idx_client", columnList = "client_id")
})
@EntityListeners(AuditingEntityListener.class)
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", unique = true)
    private String receiptNumber;

    @Column(name = "receipt_date")
    private LocalDateTime receiptDate;

    @Column(name = "total_amount")
    private Float totalAmount;

    @Column(name = "ice_number")
    private String iceNumber; // "I.C.E" number in PDFs

    @Column(name = "reference_number")
    private String referenceNumber; // "Réf Bon Commande" in PDFs

    @Column(name = "delivery_note_numbers")
    private String deliveryNoteNumbers;

    @Column(name = "tva_percentage")
    private Float tvaPercentage;  // From "TVA" field (0% in PDFs)

    @Column(name = "total_ht")
    private Float totalHT;  // "Total HT" in PDFs

    @Column(name = "total_ttc")
    private Float totalTTC;  // "Total TTC" in PDFs

    @Column(name = "payment_terms")
    private String paymentTerms;  // "Condition de paiement: Paiement à 60 jours"

    @Column(name = "bank_account")
    private String bankAccount;  // BMCE BANK account details

    @Column(name = "bank_details")
    private String bankDetails;  // Full bank information

    @Column(name = "issuing_department")
    private String issuingDepartment;  // "Organe Emetteur: DG/DPR"

    @Column(name = "delivery_ref")
    private String deliveryRef;  // "Basé sur Livraison XXX"

    @Column(name = "delivery_received")
    private Boolean deliveryReceived;  // "Accusé de réception: OUI/NON"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ReceiptItem> receiptItems = new HashSet<>();

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ReceiptAttachment> attachments = new HashSet<>();

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
        this.totalAmount = receiptItems.stream()
                .map(ReceiptItem::getSubtotal)
                .reduce(0f, Float::sum);
    }

    public void addReceiptItem(ReceiptItem item) {
        if (receiptItems == null) {
            receiptItems = new HashSet<>();
        }
        receiptItems.add(item);
        item.setReceipt(this);
    }

    public void removeReceiptItem(ReceiptItem item) {
        receiptItems.remove(item);
        item.setReceipt(null);
    }

    public void addAttachment(ReceiptAttachment attachment) {
        attachments.add(attachment);
        attachment.setReceipt(this);
    }

    public void removeAttachment(ReceiptAttachment attachment) {
        attachments.remove(attachment);
        attachment.setReceipt(null);
    }
}
