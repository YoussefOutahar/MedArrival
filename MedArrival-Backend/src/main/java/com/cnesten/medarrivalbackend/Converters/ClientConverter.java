package com.cnesten.medarrivalbackend.Converters;

import com.cnesten.medarrivalbackend.DTO.ClientDTO;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ClientConverter {

    public ClientDTO toDTO(Client client) {
        if (client == null) return null;

        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setAddress(client.getAddress());
        dto.setClientType(client.getClientType());
        dto.setCreatedAt(client.getCreatedAt());
        dto.setUpdatedAt(client.getUpdatedAt());
        dto.setCreatedBy(client.getCreatedBy());
        dto.setUpdatedBy(client.getUpdatedBy());
        return dto;
    }

    public Client toEntity(ClientDTO dto) {
        if (dto == null) return null;

        Client client = new Client();
        client.setId(dto.getId());
        client.setName(dto.getName());
        client.setAddress(dto.getAddress());
        client.setClientType(dto.getClientType());
        client.setCreatedAt(dto.getCreatedAt());
        client.setUpdatedAt(dto.getUpdatedAt());
        client.setCreatedBy(dto.getCreatedBy());
        client.setUpdatedBy(dto.getUpdatedBy());
        return client;
    }
}
