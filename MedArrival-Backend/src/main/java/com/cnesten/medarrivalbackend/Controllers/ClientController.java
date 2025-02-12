package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.AppStorage.FileStorageService;
import com.cnesten.medarrivalbackend.Converters.ClientConverter;
import com.cnesten.medarrivalbackend.Converters.ProductConverter;
import com.cnesten.medarrivalbackend.Converters.ReceiptAttachmentConverter;
import com.cnesten.medarrivalbackend.Converters.ReceiptConverter;
import com.cnesten.medarrivalbackend.DTO.ClientDTO;
import com.cnesten.medarrivalbackend.DTO.ProductDTO;
import com.cnesten.medarrivalbackend.DTO.ReceiptAttachmentDTO;
import com.cnesten.medarrivalbackend.DTO.ReceiptDTO;
import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Models.Receipts.Receipt;
import com.cnesten.medarrivalbackend.Models.Receipts.ReceiptAttachment;
import com.cnesten.medarrivalbackend.Repository.ReceiptRepository;
import com.cnesten.medarrivalbackend.Requests.PriceUpdateRequest;
import com.cnesten.medarrivalbackend.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;
    private final ReceiptAttachmentService receiptAttachmentService;
    private final FileStorageService fileStorageService;
    private final ReceiptRepository receiptRepository;
    private final ClientConverter clientConverter;
    private final ReceiptConverter receiptConverter;
    private final ReceiptAttachmentConverter attachmentConverter;
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

    @PostMapping("/{clientId}/receipts")
    public ResponseEntity<ReceiptDTO> createReceipt(
            @PathVariable Long clientId,
            @RequestBody ReceiptDTO receiptDTO) {
        Client client = clientService.findById(clientId);
        Receipt receipt = receiptConverter.toEntity(receiptDTO);
        receipt.setClient(client);
        Receipt savedReceipt = clientService.addReceipt(clientId, receipt);
        return ResponseEntity.ok(receiptConverter.toDTO(savedReceipt));
    }

    @GetMapping("/{clientId}/receipts")
    public ResponseEntity<List<ReceiptDTO>> getClientReceipts(
            @PathVariable Long clientId,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        List<Receipt> receipts = clientService.getClientReceipts(clientId, startDate, endDate);
        List<ReceiptDTO> receiptDTOs = receipts.stream()
                .map(receiptConverter::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(receiptDTOs);
    }

    @GetMapping("/{clientId}/receipts/{receiptId}")
    public ResponseEntity<ReceiptDTO> getClientReceipt(
            @PathVariable Long clientId,
            @PathVariable Long receiptId) {
        Receipt receipt = clientService.getClientReceipt(clientId, receiptId);
        return ResponseEntity.ok(receiptConverter.toDTO(receipt));
    }

    @PutMapping("/{clientId}/receipts/{receiptId}")
    public ResponseEntity<ReceiptDTO> updateReceipt(
            @PathVariable Long clientId,
            @PathVariable Long receiptId,
            @RequestBody ReceiptDTO receiptDTO) {
        Receipt receipt = receiptConverter.toEntity(receiptDTO);
        Receipt updatedReceipt = clientService.updateClientReceipt(clientId, receiptId, receipt);
        return ResponseEntity.ok(receiptConverter.toDTO(updatedReceipt));
    }

    @DeleteMapping("/{clientId}/receipts/{receiptId}")
    public ResponseEntity<Void> deleteReceipt(
            @PathVariable Long clientId,
            @PathVariable Long receiptId) {
        clientService.deleteClientReceipt(clientId, receiptId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{clientId}/receipts/{receiptId}/attachments")
    public ResponseEntity<ReceiptDTO> addAttachment(
            @PathVariable Long clientId,
            @PathVariable Long receiptId,
            @RequestParam("file") MultipartFile file) {
        Receipt receipt = clientService.getClientReceipt(clientId, receiptId);
        ReceiptAttachment attachment = receiptAttachmentService.addAttachment(receiptId, file);
        receipt.getAttachments().add(attachment);
        Receipt updatedReceipt = receiptRepository.save(receipt);
        return ResponseEntity.ok(receiptConverter.toDTO(updatedReceipt));
    }

    @GetMapping("/{clientId}/receipts/{receiptId}/attachments")
    public ResponseEntity<List<ReceiptAttachmentDTO>> getAttachments(
            @PathVariable Long clientId,
            @PathVariable Long receiptId) {
        clientService.getClientReceipt(clientId, receiptId); // Verify access
        List<ReceiptAttachment> attachments = receiptAttachmentService.getAttachments(receiptId);
        return ResponseEntity.ok(
                attachments.stream()
                        .map(attachmentConverter::toDTO)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{clientId}/receipts/{receiptId}/attachments/{attachmentId}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long clientId,
            @PathVariable Long receiptId,
            @PathVariable Long attachmentId) {
        clientService.getClientReceipt(clientId, receiptId); // Verify access
        Optional<Resource> resource = receiptAttachmentService.getAttachment(attachmentId);

        if (resource.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ReceiptAttachment attachment = receiptAttachmentService.getAttachments(receiptId).stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        return ResponseEntity.ok()
                .contentType(fileStorageService.getMediaTypeForFileName(attachment.getFileName()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getOriginalName() + "\"")
                .body(resource.get());
    }

    @DeleteMapping("/{clientId}/receipts/{receiptId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long clientId,
            @PathVariable Long receiptId,
            @PathVariable Long attachmentId) {
        clientService.getClientReceipt(clientId, receiptId); // Verify access
        receiptAttachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}