package com.cnesten.medarrivalbackend.DTO.KPI;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class KpiDTO {
    private List<DailyMetricDTO> dailyRevenue;
    private List<DailyMetricDTO> dailySales;
    private List<DailyMetricDTO> dailyArrivals;
    private List<ProductMetricDTO> topSellingProducts;
    private List<ClientMetricDTO> topClients;
    private Map<String, Double> salesByCategory;
}
