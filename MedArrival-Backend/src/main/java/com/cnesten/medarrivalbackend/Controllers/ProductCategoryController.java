package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.Converters.ProductCategoryConverter;
import com.cnesten.medarrivalbackend.DTO.ProductCategoryDTO;
import com.cnesten.medarrivalbackend.Models.ProductCategory;
import com.cnesten.medarrivalbackend.Service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ProductCategoryController {
    private final ProductCategoryService categoryService;
    private final ProductCategoryConverter categoryConverter;

    @GetMapping
    public Page<ProductCategoryDTO> getAll(Pageable pageable) {
        return categoryService.findAll(pageable)
                .map(categoryConverter::toDTO);
    }

    @GetMapping("/{id}")
    public ProductCategoryDTO getById(@PathVariable Long id) {
        return categoryConverter.toDTO(categoryService.findById(id));
    }

    @PostMapping
    public ProductCategoryDTO create(@RequestBody ProductCategoryDTO categoryDTO) {
        ProductCategory category = categoryConverter.toEntity(categoryDTO);
        return categoryConverter.toDTO(categoryService.save(category));
    }

    @PutMapping("/{id}")
    public ProductCategoryDTO update(@PathVariable Long id, @RequestBody ProductCategoryDTO categoryDTO) {
        ProductCategory category = categoryConverter.toEntity(categoryDTO);
        category.setId(id);
        return categoryConverter.toDTO(categoryService.save(category));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.deleteById(id);
    }
}
