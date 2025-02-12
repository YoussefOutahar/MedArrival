package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.AppStorage.FileStorageService;
import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Receipts.Receipt;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptAttachment;
import com.cnesten.medarrivalbackend.Repository.ReceiptAttachmentRepository;
import com.cnesten.medarrivalbackend.Repository.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReceiptAttachmentService {
    private final ReceiptAttachmentRepository attachmentRepository;
    private final ReceiptRepository receiptRepository;
    private final FileStorageService fileStorageService;

    private static final String RECEIPT_ATTACHMENTS_DIR = "receipts";

    @Transactional
    public ReceiptAttachment addAttachment(Long receiptId, MultipartFile file) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found"));

        Optional<String> storedFilePath = fileStorageService.store(file, RECEIPT_ATTACHMENTS_DIR);
        if (storedFilePath.isEmpty()) {
            throw new RuntimeException("Failed to store file");
        }

        ReceiptAttachment attachment = new ReceiptAttachment();
        attachment.setReceipt(receipt);
        attachment.setFileName(storedFilePath.get());
        attachment.setOriginalName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());

        return attachmentRepository.save(attachment);
    }

    public List<ReceiptAttachment> getAttachments(Long receiptId) {
        return attachmentRepository.findByReceiptId(receiptId);
    }

    public Optional<Resource> getAttachment(Long attachmentId) {
        ReceiptAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        return fileStorageService.loadAsResource(attachment.getFileName());
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        ReceiptAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        fileStorageService.delete(attachment.getFileName());
        attachmentRepository.delete(attachment);
    }
}