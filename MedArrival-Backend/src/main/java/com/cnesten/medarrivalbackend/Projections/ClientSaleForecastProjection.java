package com.cnesten.medarrivalbackend.Projections;

public interface ClientSaleForecastProjection {
    String getClientName();
    String getProductName();
    Integer getExpectedQuantity();
    Float getUnitPrice();
}
