package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SaleService {
    private final SaleRepository saleRepository;

    public Sale save(Sale sale) {
        return saleRepository.save(sale);
    }

    public Sale findById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
    }

    public Page<Sale> findAll(Pageable pageable) {
        return saleRepository.findAll(pageable);
    }

    public void deleteById(Long id) {
        saleRepository.deleteById(id);
    }

    public List<Sale> findByClient(Long clientId) {
        return saleRepository.findByClient_Id(clientId);
    }

    public List<Sale> findByProduct(Long productId) {
        return saleRepository.findByProduct_Id(productId);
    }
}
