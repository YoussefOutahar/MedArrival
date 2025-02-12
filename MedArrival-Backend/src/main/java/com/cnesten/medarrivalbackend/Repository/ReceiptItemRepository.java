package com.cnesten.medarrivalbackend.Repository;

import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceiptItemRepository extends JpaRepository<ReceiptItem, Long> {
}
