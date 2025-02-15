package com.cnesten.medarrivalbackend.Service;


import com.cnesten.medarrivalbackend.Exceptions.ResourceNotFoundException;
import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import com.cnesten.medarrivalbackend.Models.Price.SalePriceComponent;
import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Repository.ArrivalRepository;
import com.cnesten.medarrivalbackend.Repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArrivalService {
    private final ArrivalRepository arrivalRepository;
    private final SaleRepository saleRepository;

    @Transactional
    public Arrival save(Arrival arrival) {
        log.info("Starting to save arrival with {} sales", arrival.getSales().size());

        if (arrival.getId() != null && arrival.getId() == 0) {
            log.debug("Setting arrival ID to null for new arrival");
            arrival.setId(null);
        }

        if (arrival.getSales() != null) {
            arrival.getSales().forEach(sale -> {
                log.info("Processing sale for product: {}, client: {}",
                        sale.getProduct().getName(),
                        sale.getClient().getName());
                log.debug("Sale has {} price components",
                        sale.getPriceComponents() != null ? sale.getPriceComponents().size() : 0);

                if (sale.getId() != null && sale.getId() == 0) {
                    sale.setId(null);
                }
                processSale(sale);
            });
        }

        Arrival savedArrival = arrivalRepository.save(arrival);
        log.info("Saved arrival with ID: {}", savedArrival.getId());
        return savedArrival;
    }

    private void processSale(Sale sale) {
        log.info("Processing sale: Client type: {}, Has price components: {}",
                sale.getClient().getClientType(),
                sale.getPriceComponents() != null && !sale.getPriceComponents().isEmpty());

        if (sale.getPriceComponents() == null) {
            log.debug("Price components is null, initializing new set");
            sale.setPriceComponents(new HashSet<>());
        }

        Set<SalePriceComponent> finalComponents;

        if (sale.getPriceComponents().isEmpty()) {
            log.debug("No price components provided, creating defaults");
            finalComponents = createSalePriceComponents(sale);
        } else {
            finalComponents = new HashSet<>();
            log.info("Processing {} existing price components", sale.getPriceComponents().size());

            sale.getPriceComponents().forEach(component -> {
                log.debug("Processing component: type={}, amount={}, usesDefault={}",
                        component.getComponentType(),
                        component.getAmount(),
                        component.getUsesDefaultPrice());

                if (component.getId() != null && component.getId() == 0) {
                    component.setId(null);
                }

                if (component.getUsesDefaultPrice()) {
                    log.debug("Component uses default price, looking for default price");
                    Optional<PriceComponent> defaultPrice = sale.getProduct().getPriceComponents().stream()
                            .filter(pc -> pc.getComponentType() == component.getComponentType()
                                    && pc.getClient() == null)
                            .findFirst();

                    if (defaultPrice.isPresent()) {
                        log.debug("Found default price: {}, updating component", defaultPrice.get().getAmount());
                        component.setAmount(defaultPrice.get().getAmount());
                    } else {
                        log.warn("No default price found for component type: {}", component.getComponentType());
                    }
                } else {
                    log.debug("Keeping custom price: {}", component.getAmount());
                }

                component.setSale(sale);
                finalComponents.add(component);
            });
        }

        log.info("Setting {} final price components for sale", finalComponents.size());
        sale.setPriceComponents(finalComponents);
    }

    private Set<SalePriceComponent> createSalePriceComponents(Sale sale) {
        log.info("Creating sale price components for client type: {}", sale.getClient().getClientType());

        Set<SalePriceComponent> components;
        Product product = sale.getProduct();
        Client client = sale.getClient();

        if (client.getClientType() == ClientType.CLIENT_RP) {
            log.debug("Creating default price components for CLIENT_RP");
            components = createDefaultPriceComponents(sale, product);
        } else {
            log.debug("Creating client-specific price components for CLIENT_MARCHER");
            components = createClientSpecificPriceComponents(sale, product, client);
        }

        log.debug("Created {} price components", components.size());
        return components;
    }

    private Set<SalePriceComponent> createDefaultPriceComponents(Sale sale, Product product) {
        log.debug("Creating default price components for product: {}", product.getName());

        Set<SalePriceComponent> components = new HashSet<>();

        product.getPriceComponents().stream()
                .filter(pc -> pc.getClient() == null)
                .forEach(defaultPc -> {
                    log.debug("Creating component: type={}, amount={}",
                            defaultPc.getComponentType(),
                            defaultPc.getAmount());

                    SalePriceComponent spc = new SalePriceComponent();
                    spc.setSale(sale);
                    spc.setComponentType(defaultPc.getComponentType());
                    spc.setAmount(defaultPc.getAmount());
                    spc.setUsesDefaultPrice(true);
                    components.add(spc);
                });

        log.debug("Created {} default components", components.size());
        return components;
    }

    private Set<SalePriceComponent> createClientSpecificPriceComponents(Sale sale, Product product, Client client) {
        log.debug("Creating client-specific price components for client: {}", client.getName());

        Set<SalePriceComponent> components = new HashSet<>();

        for (PriceComponentType type : PriceComponentType.values()) {
            log.debug("Processing component type: {}", type);

            Optional<PriceComponent> clientSpecificPrice = product.getPriceComponents().stream()
                    .filter(pc -> pc.getComponentType() == type
                            && pc.getClient() != null
                            && pc.getClient().getId().equals(client.getId()))
                    .findFirst();

            if (clientSpecificPrice.isPresent()) {
                log.debug("Found client-specific price: {}", clientSpecificPrice.get().getAmount());
                SalePriceComponent spc = new SalePriceComponent();
                spc.setSale(sale);
                spc.setComponentType(type);
                spc.setAmount(clientSpecificPrice.get().getAmount());
                spc.setUsesDefaultPrice(false);
                components.add(spc);
            } else {
                log.debug("No client-specific price found, looking for default price");
                product.getPriceComponents().stream()
                        .filter(pc -> pc.getComponentType() == type && pc.getClient() == null)
                        .findFirst()
                        .ifPresent(defaultPc -> {
                            log.debug("Using default price: {}", defaultPc.getAmount());
                            SalePriceComponent spc = new SalePriceComponent();
                            spc.setSale(sale);
                            spc.setComponentType(type);
                            spc.setAmount(defaultPc.getAmount());
                            spc.setUsesDefaultPrice(true);
                            components.add(spc);
                        });
            }
        }

        log.debug("Created {} client-specific components", components.size());
        return components;
    }

    @Transactional
    public void deleteById(Long id) {
        Arrival arrival = findById(id);
        arrival.getSales().forEach(sale -> sale.getArrivals().remove(arrival));
        saleRepository.saveAll(arrival.getSales());
        arrivalRepository.deleteById(id);
    }

    public Arrival findById(Long id) {
        return arrivalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Arrival not found"));
    }

    public Page<Arrival> findAll(Pageable pageable) {
        return arrivalRepository.findAll(pageable);
    }

    public List<Arrival> findBySupplier(Long supplierId) {
        return arrivalRepository.findBySupplier_Id(supplierId);
    }

    public List<Arrival> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return arrivalRepository.findByArrivalDateBetween(start, end);
    }

    public Arrival findByInvoiceNumber(String invoiceNumber) {
        return arrivalRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Arrival not found"));
    }
}