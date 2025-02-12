package com.cnesten.medarrivalbackend.Repository;


import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Receipts.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByClient(Client client);
    List<Receipt> findByClientAndReceiptDateBetween(Client client, LocalDateTime startDate, LocalDateTime endDate);
}