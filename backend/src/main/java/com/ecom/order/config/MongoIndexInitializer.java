package com.ecom.order.config;

import com.ecom.order.domain.entity.Order;
import com.ecom.order.domain.entity.Product;
import com.ecom.order.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.CompoundIndexDefinition;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.stereotype.Component;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@RequiredArgsConstructor
public class MongoIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(MongoIndexInitializer.class);

    private final MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    @org.springframework.core.annotation.Order(1)
    public void createIndexes() {
        try {
            createProductIndexes();
            createUserIndexes();
            createOrderIndexes();
            log.info("MongoDB indexes created successfully");
        } catch (Exception e) {
            log.warn("MongoDB index creation warning: {}", e.getMessage());
        }
    }

    private void createProductIndexes() {
        IndexOperations ops = mongoTemplate.indexOps(com.ecom.order.domain.entity.Product.class);
        ops.ensureIndex(new Index().on("sku", Sort.Direction.ASC).unique().named("idx_product_sku_unique"));
        ops.ensureIndex(new Index().on("category", Sort.Direction.ASC).on("active", Sort.Direction.ASC).named("idx_product_category_active"));
        ops.ensureIndex(new Index().on("brand", Sort.Direction.ASC).named("idx_product_brand"));
        ops.ensureIndex(new Index().on("active", Sort.Direction.ASC).named("idx_product_active"));
    }

    private void createUserIndexes() {
        IndexOperations ops = mongoTemplate.indexOps(com.ecom.order.domain.entity.User.class);
        ops.ensureIndex(new Index().on("email", Sort.Direction.ASC).unique().named("idx_user_email_unique"));
    }

    private void createOrderIndexes() {
        IndexOperations ops = mongoTemplate.indexOps(com.ecom.order.domain.entity.Order.class);
        ops.ensureIndex(new Index().on("idempotencyKey", Sort.Direction.ASC).unique().sparse().named("idx_order_idempotency_unique"));
        ops.ensureIndex(new CompoundIndexDefinition(
                new Document("status", 1).append("createdAt", -1)).named("idx_order_status_created"));
        ops.ensureIndex(new CompoundIndexDefinition(
                new Document("customer.customerId", 1).append("createdAt", -1)).named("idx_order_customer_created"));
        ops.ensureIndex(new CompoundIndexDefinition(
                new Document("syncedToSearch", 1).append("status", 1)).named("idx_order_sync"));
        ops.ensureIndex(new Index().on("createdAt", Sort.Direction.DESC).named("idx_order_created_at"));
    }
}
