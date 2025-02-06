package com.cnesten.medarrivalbackend.Requests;

import com.cnesten.medarrivalbackend.Models.Price.PriceComponentType;
import lombok.Data;

@Data
public class PriceUpdateRequest {
    private PriceComponentType componentType;
    private Float amount;
}