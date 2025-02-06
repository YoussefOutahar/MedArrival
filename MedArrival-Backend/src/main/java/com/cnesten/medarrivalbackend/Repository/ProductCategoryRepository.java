package com.cnesten.medarrivalbackend.Repository;

import com.cnesten.medarrivalbackend.Models.ProductCategory;
import com.cnesten.medarrivalbackend.Projections.CategorySalesProjection;
import com.cnesten.medarrivalbackend.Projections.DailyMetricProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    Long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query(value = """
    SELECT pc.name as category, SUM(s.total_amount) as totalSales 
    FROM products_categories pc 
    JOIN products p ON p.category_id = pc.id 
    JOIN sales s ON s.product_id = p.id 
    WHERE s.sale_date BETWEEN :startDate AND :endDate 
    GROUP BY pc.name
    """, nativeQuery = true)
    List<CategorySalesProjection> findSalesByCategory(@Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);

    Optional<ProductCategory> findByName(String categoryName);
}
