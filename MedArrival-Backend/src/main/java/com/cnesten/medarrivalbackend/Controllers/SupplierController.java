package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.Converters.SupplierConverter;
import com.cnesten.medarrivalbackend.DTO.SupplierDTO;
import com.cnesten.medarrivalbackend.Models.Supplier;
import com.cnesten.medarrivalbackend.Service.BulkImportService;
import com.cnesten.medarrivalbackend.Service.SupplierService;
import com.cnesten.medarrivalbackend.Service.TemplateGeneratorService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;
    private final SupplierConverter supplierConverter;
    private final BulkImportService bulkImportService;
    private final TemplateGeneratorService templateGeneratorService;

    @GetMapping
    public Page<SupplierDTO> getAll(Pageable pageable) {
        return supplierService.findAll(pageable)
                .map(supplierConverter::toDTO);
    }

    @GetMapping("/{id}")
    public SupplierDTO getById(@PathVariable Long id) {
        return supplierConverter.toDTO(supplierService.findById(id));
    }

    @PostMapping
    public SupplierDTO create(@RequestBody SupplierDTO supplierDTO) {
        Supplier supplier = supplierConverter.toEntity(supplierDTO);
        return supplierConverter.toDTO(supplierService.save(supplier));
    }

    @PutMapping("/{id}")
    public SupplierDTO update(@PathVariable Long id, @RequestBody SupplierDTO supplierDTO) {
        Supplier supplier = supplierConverter.toEntity(supplierDTO);
        supplier.setId(id);
        return supplierConverter.toDTO(supplierService.save(supplier));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        supplierService.deleteById(id);
    }

    @PostMapping("/bulk-import")
    public ResponseEntity<List<SupplierDTO>> bulkImport(@RequestParam("file") MultipartFile file) {
        try {
            List<Supplier> importedSuppliers = bulkImportService.importSuppliersFromFile(file);
            List<SupplierDTO> supplierDTOs = importedSuppliers.stream()
                    .map(supplierConverter::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(supplierDTOs);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/template/csv")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        byte[] template = templateGeneratorService.generateSupplierCsvTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=supplier-template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(template);
    }

    @GetMapping("/template/excel")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        try {
            byte[] template = templateGeneratorService.generateSupplierExcelTemplate();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=supplier-template.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(template);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}