package com.cnesten.medarrivalbackend.Service;


import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Repository.ArrivalRepository;
import com.cnesten.medarrivalbackend.Repository.ProductRepository;
import com.cnesten.medarrivalbackend.Repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ArrivalService {
    private final ArrivalRepository arrivalRepository;
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Arrival save(Arrival arrival) {
        // First, create and save the arrival without sales
        Arrival newArrival = new Arrival();
        newArrival.setInvoiceNumber(arrival.getInvoiceNumber());
        newArrival.setArrivalDate(arrival.getArrivalDate());
        newArrival.setSupplier(arrival.getSupplier());

        // Save the arrival first
        Arrival savedArrival = arrivalRepository.save(newArrival);

        // Now handle the sales
        Set<Sale> savedSales = new HashSet<>();
        for (Sale sale : arrival.getSales()) {
            Sale newSale = new Sale();
            Product product = productRepository.findById(sale.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // Copy sale properties
            newSale.setQuantity(sale.getQuantity());
            newSale.setExpectedQuantity(sale.getExpectedQuantity());
            newSale.setSaleDate(sale.getSaleDate());
            newSale.setIsConform(sale.getIsConform());
            newSale.setExpectedDeliveryDate(sale.getExpectedDeliveryDate());

            // Set relationships
            newSale.setProduct(product);
            newSale.setClient(sale.getClient());

            // Validate the sale before saving
            validateSale(newSale);

            // Save the sale - total amount will be calculated in @PrePersist
            Sale savedSale = saleRepository.save(newSale);
            savedSales.add(savedSale);
        }

        // Update the arrival with saved sales
        savedArrival.setSales(savedSales);
        return arrivalRepository.save(savedArrival);
    }

    private void validateSale(Sale sale) {
        if (sale.getQuantity() <= 0) {
            throw new IllegalArgumentException("Sale quantity must be greater than 0");
        }
        if (sale.getProduct() == null) {
            throw new IllegalArgumentException("Sale must have a product");
        }
        if (sale.getClient() == null) {
            throw new IllegalArgumentException("Sale must have a client");
        }
        if (sale.getExpectedDeliveryDate() == null) {
            throw new IllegalArgumentException("Sale must have an expected delivery date");
        }
    }

    @Transactional
    public void deleteById(Long id) {
        Arrival arrival = findById(id);
        arrival.getSales().forEach(sale -> sale.getArrivals().remove(arrival));
        saleRepository.saveAll(arrival.getSales());
        arrivalRepository.deleteById(id);
    }

    public Arrival findById(Long id) {
        return arrivalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Arrival not found"));
    }

    public Page<Arrival> findAll(Pageable pageable) {
        return arrivalRepository.findAll(pageable);
    }

    public List<Arrival> findBySupplier(Long supplierId) {
        return arrivalRepository.findBySupplier_Id(supplierId);
    }

    public List<Arrival> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return arrivalRepository.findByArrivalDateBetween(start, end);
    }

    public Arrival findByInvoiceNumber(String invoiceNumber) {
        return arrivalRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Arrival not found"));
    }
}