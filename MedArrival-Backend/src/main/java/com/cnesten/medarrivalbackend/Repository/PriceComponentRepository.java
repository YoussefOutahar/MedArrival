package com.cnesten.medarrivalbackend.Repository;

import com.cnesten.medarrivalbackend.Models.Price.PriceComponent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceComponentRepository extends JpaRepository<PriceComponent, Long> {
}
