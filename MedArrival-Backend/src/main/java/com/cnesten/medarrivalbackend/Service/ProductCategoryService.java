package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.ProductCategory;
import com.cnesten.medarrivalbackend.Repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {
    private final ProductCategoryRepository categoryRepository;

    @Transactional
    public ProductCategory save(ProductCategory category) {
        return categoryRepository.save(category);
    }

    public ProductCategory findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    public Page<ProductCategory> findAll(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    @Transactional
    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }

    public Optional<ProductCategory> findByName(String categoryName) {
        return categoryRepository.findByName(categoryName);
    }
}
