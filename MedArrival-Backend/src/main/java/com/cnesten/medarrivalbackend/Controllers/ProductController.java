package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.Converters.ProductConverter;
import com.cnesten.medarrivalbackend.DTO.ProductDTO;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Service.ClientService;
import com.cnesten.medarrivalbackend.Service.ProductBulkImportService;
import com.cnesten.medarrivalbackend.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final ClientService clientService;
    private final ProductConverter productConverter;
    private final ProductBulkImportService productBulkImportService;

    @GetMapping
    public Page<ProductDTO> getAll(Pageable pageable) {
        return productService.findAll(pageable)
                .map(productConverter::toDTO);
    }

    @GetMapping("/{id}")
    public ProductDTO getById(@PathVariable Long id) {
        return productConverter.toDTO(productService.findById(id));
    }

    @PostMapping
    public ProductDTO create(@RequestBody ProductDTO productDTO) {
        Product product = productConverter.toEntity(productDTO);
        return productConverter.toDTO(productService.save(product));
    }

    @PutMapping("/{id}")
    public ProductDTO update(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        Product product = productConverter.toEntity(productDTO);
        product.setId(id);
        return productConverter.toDTO(productService.save(product));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.deleteById(id);
    }

    @GetMapping("/category/{categoryId}")
    public List<ProductDTO> getByCategory(@PathVariable Long categoryId) {
        return productService.findByCategory(categoryId).stream()
                .map(productConverter::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/client/{clientId}")
    public Page<ProductDTO> getProductsForClient(
            @PathVariable Long clientId,
            Pageable pageable) {
        Client client = clientService.findById(clientId);
        return productService.findAllWithClientPricing(pageable, client)
                .map(productConverter::toDTO);
    }

    @GetMapping("/client/{clientId}/product/{productId}")
    public ProductDTO getProductForClient(
            @PathVariable Long clientId,
            @PathVariable Long productId) {
        Client client = clientService.findById(clientId);
        return productConverter.toDTO(
                productService.getProductWithClientPricing(productId, client)
        );
    }

    @PostMapping("/{productId}/client/{clientId}/pricing")
    public ProductDTO setCustomPricingForClient(
            @PathVariable Long productId,
            @PathVariable Long clientId,
            @RequestBody Map<PriceComponentType, Float> priceComponents) {
        return productConverter.toDTO(
                productService.setCustomPricingForClient(productId, clientId, priceComponents)
        );
    }

    @DeleteMapping("/{productId}/client/{clientId}/pricing")
    public ProductDTO removeCustomPricingForClient(
            @PathVariable Long productId,
            @PathVariable Long clientId) {
        return productConverter.toDTO(
                productService.removeCustomPricingForClient(productId, clientId)
        );
    }

    @PostMapping("/bulk-import")
    public ResponseEntity<List<ProductDTO>> bulkImport(@RequestParam("file") MultipartFile file) {
        try {
            List<Product> importedProducts = productBulkImportService.importProductsFromFile(file);
            List<ProductDTO> productDTOs = importedProducts.stream()
                    .map(productConverter::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(productDTOs);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/template/csv")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        byte[] template = productBulkImportService.generateProductCsvTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=product-template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(template);
    }

    @GetMapping("/template/excel")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        try {
            byte[] template = productBulkImportService.generateProductExcelTemplate();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=product-template.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(template);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
