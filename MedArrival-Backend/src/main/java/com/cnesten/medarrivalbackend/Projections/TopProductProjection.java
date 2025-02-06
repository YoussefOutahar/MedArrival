package com.cnesten.medarrivalbackend.Projections;

public interface TopProductProjection {
    Long getId();
    String getName();
    Integer getSaleCount();
    Double getTotalRevenue();
}
