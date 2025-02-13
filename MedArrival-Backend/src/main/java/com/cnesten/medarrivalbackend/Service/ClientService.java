package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Models.Receipts.Receipt;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptItem;
import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Repository.ClientRepository;
import com.cnesten.medarrivalbackend.Repository.ProductRepository;
import com.cnesten.medarrivalbackend.Repository.ReceiptRepository;
import com.cnesten.medarrivalbackend.Repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final ReceiptRepository receiptRepository;

    public Client save(Client client) {
        if (client.getId() != null) {
            Client existingClient = clientRepository.findById(client.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

            existingClient.setName(client.getName());
            existingClient.setAddress(client.getAddress());
            existingClient.setClientType(client.getClientType());

            return clientRepository.save(existingClient);
        }
        return clientRepository.save(client);
    }

    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
    }

    public Page<Client> findAll(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }

    public void deleteById(Long id) {
        clientRepository.deleteById(id);
    }

    public List<Client> findByClientType(ClientType clientType) {
        return clientRepository.findByClientType(clientType);
    }

    public List<Product> getClientProducts(Long clientId) {
        Client client = findById(clientId);
        if (client.getClientType() != ClientType.CLIENT_MARCHER) {
            throw new IllegalStateException("Only CLIENT_MARCHER can access their product list");
        }
        return productRepository.findAll();
    }

    public void updateClientPrice(Long clientId, Long productId, PriceComponentType componentType, Float amount) {
        Client client = findById(clientId);
        if (client.getClientType() != ClientType.CLIENT_MARCHER) {
            throw new IllegalStateException("Only CLIENT_MARCHER can have custom prices");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        PriceComponent priceComponent = new PriceComponent();
        priceComponent.setProduct(product);
        priceComponent.setClient(client);
        priceComponent.setComponentType(componentType);
        priceComponent.setAmount(amount);
        priceComponent.setEffectiveFrom(LocalDateTime.now());

        product.addPriceComponent(priceComponent);
        productRepository.save(product);
    }

    public Client toggleClientType(Long clientId) {
        Client client = findById(clientId);
        client.setClientType(client.getClientType() == ClientType.CLIENT_MARCHER ?
                ClientType.CLIENT_RP : ClientType.CLIENT_MARCHER);
        return clientRepository.save(client);
    }


    @Transactional
    public Receipt addReceipt(Long clientId, Receipt receipt) {
        Client client = findById(clientId);
        receipt.setClient(client);

        if (receipt.getReceiptNumber() == null) {
            receipt.setReceiptNumber(generateReceiptNumber());
        }

        if (receipt.getReceiptDate() == null) {
            receipt.setReceiptDate(LocalDateTime.now());
        }

        // Create new receipt items
        Set<ReceiptItem> newItems = new HashSet<>();
        receipt.getReceiptItems().forEach(item -> {
            ReceiptItem newItem = new ReceiptItem();
            newItem.setProduct(item.getProduct());
            newItem.setQuantity(item.getQuantity());
            newItem.setUnitPrice(item.getUnitPrice());
            newItem.setLotNumber(item.getLotNumber());
            newItem.setCalibrationDate(item.getCalibrationDate());
            newItem.setExpirationDate(item.getExpirationDate());
            newItem.setArticleCode(item.getArticleCode());
            newItem.setDescription(item.getDescription());
            newItem.setUnit(item.getUnit());
            newItem.setReceipt(receipt);
            newItems.add(newItem);
        });

        receipt.setReceiptItems(newItems);

        try {
            return receiptRepository.save(receipt);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new RuntimeException("Concurrent modification detected. Please try again.", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Receipt> getClientReceipts(Long clientId, LocalDateTime startDate, LocalDateTime endDate) {
        Client client = findById(clientId);
        if (startDate != null && endDate != null) {
            return receiptRepository.findByClientAndReceiptDateBetween(client, startDate, endDate);
        }
        return receiptRepository.findByClient(client);
    }

    @Transactional(readOnly = true)
    public Receipt getClientReceipt(Long clientId, Long receiptId) {
        Client client = findById(clientId);
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found"));

        if (!receipt.getClient().getId().equals(clientId)) {
            throw new IllegalStateException("Receipt does not belong to this client");
        }

        return receipt;
    }

    @Transactional
    public Receipt updateClientReceipt(Long clientId, Long receiptId, Receipt updatedReceipt) {
        Receipt existingReceipt = getClientReceipt(clientId, receiptId);

        existingReceipt.setReceiptDate(updatedReceipt.getReceiptDate());
        // Update receipt items
        existingReceipt.getReceiptItems().clear();
        updatedReceipt.getReceiptItems().forEach(item -> {
            item.setReceipt(existingReceipt);
            existingReceipt.addReceiptItem(item);
        });

        return receiptRepository.save(existingReceipt);
    }

    @Transactional
    public void deleteClientReceipt(Long clientId, Long receiptId) {
        Receipt receipt = getClientReceipt(clientId, receiptId);
        receiptRepository.delete(receipt);
    }

    public List<Product> getAvailableProducts(Long clientId) {
        Client client = findById(clientId);

        // Get all sales for this client
        List<Sale> clientSales = saleRepository.findByClient_Id(clientId);

        // Get all receipts for this client
        List<Receipt> clientReceipts = receiptRepository.findByClient(client);

        // Create a map of product quantities from sales
        Map<Product, Integer> saleQuantities = clientSales.stream()
                .collect(Collectors.groupingBy(
                        Sale::getProduct,
                        Collectors.summingInt(Sale::getQuantity)
                ));

        // Create a map of product quantities from receipts
        Map<Product, Integer> receiptQuantities = clientReceipts.stream()
                .flatMap(receipt -> receipt.getReceiptItems().stream())
                .collect(Collectors.groupingBy(
                        ReceiptItem::getProduct,
                        Collectors.summingInt(ReceiptItem::getQuantity)
                ));

        // Filter products that have remaining quantity
        return saleQuantities.entrySet().stream()
                .filter(entry -> {
                    Product product = entry.getKey();
                    int saleQty = entry.getValue();
                    int receiptQty = receiptQuantities.getOrDefault(product, 0);
                    return saleQty > receiptQty;
                })
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private String generateReceiptNumber() {
        // Implement your receipt number generation logic
        // Example: RCPT-yyyyMMdd-XXXXX
        return "FACTURE-" + LocalDateTime.now().format(DateTimeFormatter.BASIC_ISO_DATE) +
                "-" + String.format("%05d", new Random().nextInt(100000));
    }
}