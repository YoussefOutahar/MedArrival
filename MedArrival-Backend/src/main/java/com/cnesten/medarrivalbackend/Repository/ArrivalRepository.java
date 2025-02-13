package com.cnesten.medarrivalbackend.Repository;


import com.cnesten.medarrivalbackend.Models.Arrival;
import com.cnesten.medarrivalbackend.Projections.DailyMetricProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArrivalRepository extends JpaRepository<Arrival, Long> {
    List<Arrival> findBySupplier_Id(Long supplierId);
    List<Arrival> findByArrivalDateBetween(LocalDateTime start, LocalDateTime end);
    Optional<Arrival> findByInvoiceNumber(String invoiceNumber);

    @Query(value = """
        SELECT CAST(DATE(a.arrival_date) AS VARCHAR) as date, 
               COUNT(*) as value 
        FROM arrivals a 
        WHERE a.arrival_date BETWEEN :startDate AND :endDate 
        GROUP BY CAST(DATE(a.arrival_date) AS VARCHAR)
        ORDER BY date
        """, nativeQuery = true)
    List<DailyMetricProjection> findDailyArrivalsCount(@Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);

    List<Arrival> findByArrivalDateBetweenAndSales_Client_Id(LocalDateTime startDate, LocalDateTime endDate, Long clientId);
}