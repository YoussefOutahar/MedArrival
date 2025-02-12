package com.cnesten.medarrivalbackend.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class ReceiptDTO {
    private Long id;
    private String receiptNumber;
    private LocalDateTime receiptDate;
    private Float totalAmount;
    private String iceNumber;
    private String referenceNumber;
    private String deliveryNoteNumbers;
    private Float tvaPercentage;
    private Float totalHT;
    private Float totalTTC;
    private String paymentTerms;
    private String bankAccount;
    private String bankDetails;
    private String issuingDepartment;
    private String deliveryRef;
    private Boolean deliveryReceived;
    private ClientDTO client;
    private Set<ReceiptItemDTO> receiptItems = new HashSet<>();
    private Set<ReceiptAttachmentDTO> attachments = new HashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}