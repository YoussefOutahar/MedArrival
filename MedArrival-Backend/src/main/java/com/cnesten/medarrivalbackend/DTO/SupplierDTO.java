package com.cnesten.medarrivalbackend.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class SupplierDTO {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private Set<ArrivalDTO> arrivals;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
