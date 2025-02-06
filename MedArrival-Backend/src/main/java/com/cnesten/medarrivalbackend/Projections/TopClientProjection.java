package com.cnesten.medarrivalbackend.Projections;

public interface TopClientProjection {
    Long getId();
    String getName();
    Integer getOrderCount();
    Double getTotalPurchases();
}
