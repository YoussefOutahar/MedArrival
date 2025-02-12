package com.cnesten.medarrivalbackend.Repository;

import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceiptAttachmentRepository extends JpaRepository<ReceiptAttachment, Long> {
    List<ReceiptAttachment> findByReceiptId(Long receiptId);
}
