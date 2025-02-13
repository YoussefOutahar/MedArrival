package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.ReceiptAttachmentDTO;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptAttachment;
import org.springframework.stereotype.Component;

@Component
public class ReceiptAttachmentConverter {

    public ReceiptAttachmentDTO toDTO(ReceiptAttachment attachment) {
        if (attachment == null) return null;

        ReceiptAttachmentDTO dto = new ReceiptAttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setOriginalName(attachment.getOriginalName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setCreatedAt(attachment.getCreatedAt());
        dto.setUpdatedAt(attachment.getUpdatedAt());
        dto.setCreatedBy(attachment.getCreatedBy());
        dto.setUpdatedBy(attachment.getUpdatedBy());

        return dto;
    }

    public ReceiptAttachment toEntity(ReceiptAttachmentDTO dto) {
        if (dto == null) return null;

        ReceiptAttachment attachment = new ReceiptAttachment();
        attachment.setId(dto.getId());
        attachment.setFileName(dto.getFileName());
        attachment.setOriginalName(dto.getOriginalName());
        attachment.setFileType(dto.getFileType());
        attachment.setFileSize(dto.getFileSize());
        attachment.setCreatedAt(dto.getCreatedAt());
        attachment.setUpdatedAt(dto.getUpdatedAt());
        attachment.setCreatedBy(dto.getCreatedBy());
        attachment.setUpdatedBy(dto.getUpdatedBy());

        return attachment;
    }
}