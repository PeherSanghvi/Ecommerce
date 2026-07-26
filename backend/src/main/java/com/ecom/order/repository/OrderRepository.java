package com.ecom.order.repository;

import com.ecom.order.domain.entity.Order;
import com.ecom.order.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    Optional<Order> findByIdempotencyKey(String idempotencyKey);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    Page<Order> findByCustomer_CustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);

    @Query("{ 'syncedToSearch': false }")
    List<Order> findUnsynced(Pageable pageable);

    List<Order> findBySyncedToSearchFalse();

    List<Order> findByCreatedAtBetween(Instant from, Instant to);

    long countByStatus(OrderStatus status);
}
