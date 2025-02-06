package com.cnesten.medarrivalbackend.Repository;

import com.cnesten.medarrivalbackend.Models.Product;
import com.cnesten.medarrivalbackend.Projections.TopProductProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory_Id(Long categoryId);

    @Query(value = """
        SELECT p.id as id, p.name as name, 
               COUNT(s.id) as saleCount, 
               CAST(SUM(s.total_amount) AS DECIMAL(10,2)) as totalRevenue 
        FROM products p 
        JOIN sales s ON s.product_id = p.id 
        WHERE s.sale_date BETWEEN :startDate AND :endDate 
        GROUP BY p.id, p.name 
        ORDER BY totalRevenue DESC 
        LIMIT :limit
        """, nativeQuery = true)
    List<TopProductProjection> findTopSellingProducts(@Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate,
                                                      @Param("limit") int limit);
}
