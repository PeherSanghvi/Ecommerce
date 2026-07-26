package com.ecom.order.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private String id;
    private String sku;
    private String title;
    private String description;
    private String brand;
    private String category;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private long priceCents;
    private double discountPercentage;
    private long effectivePriceCents;
    private int stockQuantity;
    private double rating;
    private boolean active;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
}
