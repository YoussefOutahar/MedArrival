package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.Converters.ArrivalConverter;
import com.cnesten.medarrivalbackend.DTO.ArrivalDTO;
import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Service.ArrivalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/arrivals")
@RequiredArgsConstructor
public class ArrivalController {
    private final ArrivalService arrivalService;
    private final ArrivalConverter arrivalConverter;

    @GetMapping
    public Page<ArrivalDTO> getAll(Pageable pageable) {
        return arrivalService.findAll(pageable)
                .map(arrivalConverter::toDTO);
    }

    @GetMapping("/{id}")
    public ArrivalDTO getById(@PathVariable Long id) {
        return arrivalConverter.toDTO(arrivalService.findById(id));
    }

    @PostMapping
    public ArrivalDTO create(@RequestBody ArrivalDTO arrivalDTO) {
        Arrival arrival = arrivalConverter.toEntity(arrivalDTO);
        return arrivalConverter.toDTO(arrivalService.save(arrival));
    }

    @PutMapping("/{id}")
    public ArrivalDTO update(@PathVariable Long id, @RequestBody ArrivalDTO arrivalDTO) {
        Arrival arrival = arrivalConverter.toEntity(arrivalDTO);
        arrival.setId(id);
        return arrivalConverter.toDTO(arrivalService.save(arrival));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        arrivalService.deleteById(id);
    }

    @GetMapping("/supplier/{supplierId}")
    public List<ArrivalDTO> getBySupplier(@PathVariable Long supplierId) {
        return arrivalService.findBySupplier(supplierId).stream()
                .map(arrivalConverter::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/date-range")
    public List<ArrivalDTO> getByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        return arrivalService.findByDateRange(start, end).stream()
                .map(arrivalConverter::toDTO)
                .collect(Collectors.toList());
    }
}

