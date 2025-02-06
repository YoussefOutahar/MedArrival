package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.Converters.ClientConverter;
import com.cnesten.medarrivalbackend.Converters.ProductConverter;
import com.cnesten.medarrivalbackend.DTO.ClientDTO;
import com.cnesten.medarrivalbackend.DTO.ProductDTO;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Requests.PriceUpdateRequest;
import com.cnesten.medarrivalbackend.Service.BulkImportService;
import com.cnesten.medarrivalbackend.Service.ClientService;
import com.cnesten.medarrivalbackend.Service.ProductService;
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
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;
    private final ProductService productService;
    private final ClientConverter clientConverter;
    private final ProductConverter productConverter;
    private final BulkImportService bulkImportService;
    private final TemplateGeneratorService templateGeneratorService;

    @GetMapping
    public Page<ClientDTO> getAll(Pageable pageable) {
        return clientService.findAll(pageable)
                .map(clientConverter::toDTO);
    }

    @GetMapping("/{id}")
    public ClientDTO getById(@PathVariable Long id) {
        return clientConverter.toDTO(clientService.findById(id));
    }

    @PostMapping
    public ClientDTO create(@RequestBody ClientDTO clientDTO) {
        Client client = clientConverter.toEntity(clientDTO);
        return clientConverter.toDTO(clientService.save(client));
    }

    @PutMapping("/{id}")
    public ClientDTO update(@PathVariable Long id, @RequestBody ClientDTO clientDTO) {
        Client client = clientConverter.toEntity(clientDTO);
        return clientConverter.toDTO(clientService.save(client));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        clientService.deleteById(id);
    }

    @GetMapping("/type/{clientType}")
    public List<ClientDTO> getByClientType(@PathVariable String clientType) {
        return clientService.findByClientType(ClientType.valueOf(clientType)).stream()
                .map(clientConverter::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/{clientId}/toggle-type")
    public ResponseEntity<ClientDTO> toggleClientType(@PathVariable Long clientId) {
        Client updatedClient = clientService.toggleClientType(clientId);
        return ResponseEntity.ok(clientConverter.toDTO(updatedClient));
    }

    @PostMapping("/bulk-import")
    public ResponseEntity<List<ClientDTO>> bulkImport(@RequestParam("file") MultipartFile file) {
        try {
            List<Client> importedClients = bulkImportService.importClientsFromFile(file);
            List<ClientDTO> clientDTOs = importedClients.stream()
                    .map(clientConverter::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(clientDTOs);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/template/csv")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        byte[] template = templateGeneratorService.generateClientCsvTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=client-template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(template);
    }

    @GetMapping("/template/excel")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        try {
            byte[] template = templateGeneratorService.generateClientExcelTemplate();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=client-template.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(template);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}