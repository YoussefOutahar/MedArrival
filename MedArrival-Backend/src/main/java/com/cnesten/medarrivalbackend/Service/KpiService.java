package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.DTO.KPI.*;
import com.cnesten.medarrivalbackend.Projections.*;
import com.cnesten.medarrivalbackend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KpiService {
    private final SaleRepository saleRepository;
    private final ArrivalRepository arrivalRepository;
    private final ProductCategoryRepository categoryRepository;

    public KpiDTO getDashboardKpis() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).with(LocalTime.MIN);

        KpiDTO kpiDTO = new KpiDTO();

        setTrendData(kpiDTO, startOfMonth, now);
        setProductMetrics(kpiDTO, startOfMonth, now);
        setCategoryAnalysis(kpiDTO, startOfMonth, now);
        setClientMetrics(kpiDTO, startOfMonth, now);

        return kpiDTO;
    }

    private void setTrendData(KpiDTO kpiDTO, LocalDateTime start, LocalDateTime end) {
        kpiDTO.setDailyRevenue(convertToDailyMetrics(saleRepository.findDailyRevenue(start, end)));
        kpiDTO.setDailyArrivals(convertToDailyMetrics(arrivalRepository.findDailyArrivalsCount(start, end)));
    }

    private void setProductMetrics(KpiDTO kpiDTO, LocalDateTime start, LocalDateTime end) {
        List<TopProductProjection> topProducts = saleRepository.findTopSellingProducts(start, end, 10);
        kpiDTO.setTopSellingProducts(convertToProductMetrics(topProducts));
    }

    private void setCategoryAnalysis(KpiDTO kpiDTO, LocalDateTime start, LocalDateTime end) {
        List<CategorySalesProjection> salesByCategory = categoryRepository.findSalesByCategory(start, end);
        Map<String, Double> categoryMap = salesByCategory.stream()
                .collect(Collectors.toMap(
                        CategorySalesProjection::getCategory,
                        CategorySalesProjection::getTotalSales
                ));
        kpiDTO.setSalesByCategory(categoryMap);
    }

    private void setClientMetrics(KpiDTO kpiDTO, LocalDateTime start, LocalDateTime end) {
        List<TopClientProjection> topClients = saleRepository.findTopClients(start, end, 10);
        kpiDTO.setTopClients(convertToClientMetrics(topClients));
    }

    private List<DailyMetricDTO> convertToDailyMetrics(List<DailyMetricProjection> projections) {
        return projections.stream()
                .map(p -> {
                    DailyMetricDTO dto = new DailyMetricDTO();
                    dto.setDate(p.getDate());
                    dto.setValue(p.getValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<ProductMetricDTO> convertToProductMetrics(List<TopProductProjection> projections) {
        return projections.stream()
                .map(p -> {
                    ProductMetricDTO dto = new ProductMetricDTO();
                    dto.setProductId(p.getId());
                    dto.setProductName(p.getName());
                    dto.setSalesCount(p.getSaleCount());
                    dto.setRevenue(p.getTotalRevenue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<ClientMetricDTO> convertToClientMetrics(List<TopClientProjection> projections) {
        return projections.stream()
                .map(p -> {
                    ClientMetricDTO dto = new ClientMetricDTO();
                    dto.setClientId(p.getId());
                    dto.setClientName(p.getName());
                    dto.setOrderCount(p.getOrderCount());
                    dto.setTotalPurchases(p.getTotalPurchases());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}