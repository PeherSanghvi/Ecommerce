package com.ecom.order.repository;

import com.ecom.order.domain.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByProductId(String productId);

    Optional<Review> findByProductIdAndUserId(String productId, String userId);

    void deleteByProductIdAndUserId(String productId, String userId);

    long countByProductId(String productId);
}