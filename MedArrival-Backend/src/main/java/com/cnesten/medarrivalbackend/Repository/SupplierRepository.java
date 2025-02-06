package com.cnesten.medarrivalbackend.Repository;

import com.cnesten.medarrivalbackend.Models.Supplier;
import com.cnesten.medarrivalbackend.Projections.SupplierPerformanceProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    @Query(value = """
        SELECT s.id as id, s.name as name, 
               COUNT(a.id) as deliveryCount,
               CAST(AVG(CASE WHEN a.arrival_date <= s.expected_delivery_date THEN 1.0 ELSE 0.0 END) AS DECIMAL(10,2)) as onTimeRate
        FROM suppliers s 
        JOIN arrivals a ON a.supplier_id = s.id 
        WHERE a.arrival_date BETWEEN :startDate AND :endDate 
        GROUP BY s.id, s.name
        """, nativeQuery = true)
    List<SupplierPerformanceProjection> findSupplierPerformance(@Param("startDate") LocalDateTime startDate,
                                                                @Param("endDate") LocalDateTime endDate);
}
