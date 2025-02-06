package com.cnesten.medarrivalbackend.Projections;

public interface SupplierPerformanceProjection {
    Long getId();
    String getName();
    Integer getDeliveryCount();
    Double getOnTimeRate();
}
