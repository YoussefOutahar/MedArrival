package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Repository.ClientRepository;
import com.cnesten.medarrivalbackend.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;

    public Client save(Client client) {
        if (client.getId() != null) {
            Client existingClient = clientRepository.findById(client.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

            existingClient.setName(client.getName());
            existingClient.setAddress(client.getAddress());
            existingClient.setClientType(client.getClientType());

            return clientRepository.save(existingClient);
        }
        return clientRepository.save(client);
    }

    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
    }

    public Page<Client> findAll(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }

    public void deleteById(Long id) {
        clientRepository.deleteById(id);
    }

    public List<Client> findByClientType(ClientType clientType) {
        return clientRepository.findByClientType(clientType);
    }

    public List<Product> getClientProducts(Long clientId) {
        Client client = findById(clientId);
        if (client.getClientType() != ClientType.CLIENT_MARCHER) {
            throw new IllegalStateException("Only CLIENT_MARCHER can access their product list");
        }
        return productRepository.findAll();
    }

    public void updateClientPrice(Long clientId, Long productId, PriceComponentType componentType, Float amount) {
        Client client = findById(clientId);
        if (client.getClientType() != ClientType.CLIENT_MARCHER) {
            throw new IllegalStateException("Only CLIENT_MARCHER can have custom prices");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        PriceComponent priceComponent = new PriceComponent();
        priceComponent.setProduct(product);
        priceComponent.setClient(client);
        priceComponent.setComponentType(componentType);
        priceComponent.setAmount(amount);
        priceComponent.setEffectiveFrom(LocalDateTime.now());

        product.addPriceComponent(priceComponent);
        productRepository.save(product);
    }

    public Client toggleClientType(Long clientId) {
        Client client = findById(clientId);
        client.setClientType(client.getClientType() == ClientType.CLIENT_MARCHER ?
                ClientType.CLIENT_RP : ClientType.CLIENT_MARCHER);
        return clientRepository.save(client);
    }
}