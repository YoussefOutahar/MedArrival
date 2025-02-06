package com.cnesten.medarrivalbackend.DTO;

import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClientDTO {
    private Long id;
    private String name;
    private String address;
    private ClientType clientType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
