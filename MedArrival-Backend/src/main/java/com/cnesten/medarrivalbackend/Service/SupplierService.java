package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Models.Supplier;
import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public Supplier save(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
    }

    public Page<Supplier> findAll(Pageable pageable) {
        return supplierRepository.findAll(pageable);
    }

    public void deleteById(Long id) {
        supplierRepository.deleteById(id);
    }
}
