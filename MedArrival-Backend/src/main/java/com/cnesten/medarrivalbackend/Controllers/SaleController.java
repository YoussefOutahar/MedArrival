package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.Converters.SaleConverter;
import com.cnesten.medarrivalbackend.DTO.SaleDTO;
import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {
    private final SaleService saleService;
    private final SaleConverter saleConverter;

    @GetMapping
    public Page<SaleDTO> getAll(Pageable pageable) {
        return saleService.findAll(pageable)
                .map(saleConverter::toDTO);
    }

    @GetMapping("/{id}")
    public SaleDTO getById(@PathVariable Long id) {
        return saleConverter.toDTO(saleService.findById(id));
    }

    @PostMapping
    public SaleDTO create(@RequestBody SaleDTO saleDTO) {
        Sale sale = saleConverter.toEntity(saleDTO);
        return saleConverter.toDTO(saleService.save(sale));
    }

    @PutMapping("/{id}")
    public SaleDTO update(@PathVariable Long id, @RequestBody SaleDTO saleDTO) {
        Sale sale = saleConverter.toEntity(saleDTO);
        sale.setId(id);
        return saleConverter.toDTO(saleService.save(sale));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        saleService.deleteById(id);
    }

    @GetMapping("/client/{clientId}")
    public List<SaleDTO> getByClient(@PathVariable Long clientId) {
        return saleService.findByClient(clientId).stream()
                .map(saleConverter::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/product/{productId}")
    public List<SaleDTO> getByProduct(@PathVariable Long productId) {
        return saleService.findByProduct(productId).stream()
                .map(saleConverter::toDTO)
                .collect(Collectors.toList());
    }
}
