package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.ReceiptDTO;
import com.cnesten.medarrivalbackend.Models.Receipts.Receipt;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptAttachment;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReceiptConverter {
    private final ClientConverter clientConverter;
    private final ReceiptItemConverter receiptItemConverter;
    private final ReceiptAttachmentConverter attachmentConverter;

    public ReceiptDTO toDTO(Receipt receipt) {
        if (receipt == null) return null;

        ReceiptDTO dto = new ReceiptDTO();
        dto.setId(receipt.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setReceiptDate(receipt.getReceiptDate());
        dto.setTotalAmount(receipt.getTotalAmount());
        dto.setIceNumber(receipt.getIceNumber());
        dto.setReferenceNumber(receipt.getReferenceNumber());
        dto.setDeliveryNoteNumbers(receipt.getDeliveryNoteNumbers());
        dto.setTvaPercentage(receipt.getTvaPercentage());
        dto.setTotalHT(receipt.getTotalHT());
        dto.setTotalTTC(receipt.getTotalTTC());
        dto.setPaymentTerms(receipt.getPaymentTerms());
        dto.setBankAccount(receipt.getBankAccount());
        dto.setBankDetails(receipt.getBankDetails());
        dto.setIssuingDepartment(receipt.getIssuingDepartment());
        dto.setDeliveryRef(receipt.getDeliveryRef());
        dto.setDeliveryReceived(receipt.getDeliveryReceived());
        dto.setClient(clientConverter.toDTO(receipt.getClient()));

        dto.setReceiptItems(receipt.getReceiptItems().stream()
                .map(receiptItemConverter::toDTO)
                .collect(Collectors.toSet()));

        if (receipt.getAttachments() != null) {
            dto.setAttachments(receipt.getAttachments().stream()
                    .map(attachmentConverter::toDTO)
                    .collect(Collectors.toSet()));
        }

        dto.setCreatedAt(receipt.getCreatedAt());
        dto.setUpdatedAt(receipt.getUpdatedAt());
        dto.setCreatedBy(receipt.getCreatedBy());
        dto.setUpdatedBy(receipt.getUpdatedBy());

        return dto;
    }

    public Receipt toEntity(ReceiptDTO dto) {
        if (dto == null) return null;

        Receipt receipt = new Receipt();
        receipt.setId(dto.getId());
        receipt.setReceiptNumber(dto.getReceiptNumber());
        receipt.setReceiptDate(dto.getReceiptDate());
        receipt.setTotalAmount(dto.getTotalAmount());
        receipt.setIceNumber(dto.getIceNumber());
        receipt.setReferenceNumber(dto.getReferenceNumber());
        receipt.setDeliveryNoteNumbers(dto.getDeliveryNoteNumbers());
        receipt.setTvaPercentage(dto.getTvaPercentage());
        receipt.setTotalHT(dto.getTotalHT());
        receipt.setTotalTTC(dto.getTotalTTC());
        receipt.setPaymentTerms(dto.getPaymentTerms());
        receipt.setBankAccount(dto.getBankAccount());
        receipt.setBankDetails(dto.getBankDetails());
        receipt.setIssuingDepartment(dto.getIssuingDepartment());
        receipt.setDeliveryRef(dto.getDeliveryRef());
        receipt.setDeliveryReceived(dto.getDeliveryReceived());
        receipt.setClient(clientConverter.toEntity(dto.getClient()));

        if (dto.getReceiptItems() != null) {
            receipt.setReceiptItems(dto.getReceiptItems().stream()
                    .map(itemDto -> {
                        ReceiptItem item = receiptItemConverter.toEntity(itemDto);
                        item.setReceipt(receipt);
                        return item;
                    })
                    .collect(Collectors.toSet()));
        }

        if (dto.getAttachments() != null) {
            receipt.setAttachments(dto.getAttachments().stream()
                    .map(attachmentDto -> {
                        ReceiptAttachment attachment = attachmentConverter.toEntity(attachmentDto);
                        attachment.setReceipt(receipt);
                        return attachment;
                    })
                    .collect(Collectors.toSet()));
        }

        receipt.setCreatedAt(dto.getCreatedAt());
        receipt.setUpdatedAt(dto.getUpdatedAt());
        receipt.setCreatedBy(dto.getCreatedBy());
        receipt.setUpdatedBy(dto.getUpdatedBy());

        return receipt;
    }
}