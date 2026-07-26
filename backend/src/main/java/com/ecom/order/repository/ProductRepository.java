package com.ecom.order.repository;

import com.ecom.order.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    /** Case-insensitive partial match on category field */
    @Query("{ 'active': true, 'category': { $regex: ?0, $options: 'i' } }")
    Page<Product> findByCategoryIgnoreCaseAndActiveTrue(String category, Pageable pageable);

    Page<Product> findByBrandAndActiveTrue(String brand, Pageable pageable);

    @Query("{ 'active': true, $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'brand': { $regex: ?0, $options: 'i' } }, { 'category': { $regex: ?0, $options: 'i' } } ] }")
    Page<Product> searchByKeyword(String keyword, Pageable pageable);

    List<Product> findAllByIdIn(List<String> ids);
}
