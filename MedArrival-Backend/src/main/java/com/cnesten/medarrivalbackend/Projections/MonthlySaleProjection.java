package com.cnesten.medarrivalbackend.Projections;

import com.cnesten.medarrivalbackend.Models.Product;

public interface MonthlySaleProjection {
    Product getProduct();
    Long getQuantity();
    Float getUnitPrice();
    Double getTotalAmount();
}
