package com.cnesten.medarrivalbackend.Repository;

import com.cnesten.medarrivalbackend.Models.Sale;
import com.cnesten.medarrivalbackend.Projections.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByClient_Id(Long clientId);
    List<Sale> findByProduct_Id(Long productId);

    @Query("""
    SELECT
        c.name as clientName,
        p.name as productName,
        s.expectedQuantity as expectedQuantity,
        sp.amount as unitPrice,
        s.totalAmount as totalAmount
    FROM Sale s
    JOIN s.client c
    JOIN s.product p
    JOIN s.priceComponents sp
    WHERE s.saleDate BETWEEN :startDate AND :endDate
    AND sp.componentType = 'PURCHASE_PRICE'
    ORDER BY c.name, p.name
""")
    List<ClientSaleForecastProjection> findClientSalesForecast(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );


    @Query("""
    SELECT
        p as product,
        SUM(s.quantity) as quantity,
        sp.amount as unitPrice,
        SUM(s.totalAmount) as totalAmount
    FROM Sale s
    JOIN s.product p
    JOIN s.priceComponents sp
    WHERE s.saleDate BETWEEN :startDate AND :endDate
    AND sp.componentType = 'PURCHASE_PRICE'
    GROUP BY p, sp.amount
    ORDER BY p.name
""")
    List<MonthlySaleProjection> findMonthlySalesSummary(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT s FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    List<Sale> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = """
    SELECT CAST(DATE(s.sale_date) AS VARCHAR) as date, 
           SUM(s.total_amount) as value 
    FROM sales s 
    WHERE s.sale_date BETWEEN :startDate AND :endDate 
    GROUP BY CAST(DATE(s.sale_date) AS VARCHAR)
    ORDER BY date
    """, nativeQuery = true)
    List<DailyMetricProjection> findDailyRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = """
    SELECT p.id as id, p.name as name, 
           COUNT(s.id) as salesCount, 
           SUM(s.total_amount) as totalRevenue 
    FROM products p 
    JOIN sales s ON s.product_id = p.id 
    WHERE s.sale_date BETWEEN :startDate AND :endDate 
    GROUP BY p.id, p.name 
    ORDER BY totalRevenue DESC 
    LIMIT :limit
    """, nativeQuery = true)
    List<TopProductProjection> findTopSellingProducts(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit);

    @Query(value = """
    SELECT c.id as id, c.name as name, 
           COUNT(s.id) as orderCount, 
           SUM(s.total_amount) as totalPurchases 
    FROM clients c 
    JOIN sales s ON s.client_id = c.id 
    WHERE s.sale_date BETWEEN :startDate AND :endDate 
    GROUP BY c.id, c.name 
    ORDER BY totalPurchases DESC 
    LIMIT :limit
    """, nativeQuery = true)
    List<TopClientProjection> findTopClients(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit);
}