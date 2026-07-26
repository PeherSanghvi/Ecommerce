package com.ecom.order.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200)
    private String title;

    private String description;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Category is required")
    private String category;

    private String thumbnailUrl;
    private List<String> imageUrls;

    /** Price in minor currency units (cents) */
    @Min(value = 0, message = "Price cannot be negative")
    private long priceCents;

    @DecimalMin(value = "0.0") @DecimalMax(value = "100.0")
    private double discountPercentage;

    @Min(value = 0, message = "Stock cannot be negative")
    private int stockQuantity;

    private boolean active = true;

    public String getSku() { return sku; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getBrand() { return brand; }
    public String getCategory() { return category; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public List<String> getImageUrls() { return imageUrls; }
    public long getPriceCents() { return priceCents; }
    public double getDiscountPercentage() { return discountPercentage; }
    public int getStockQuantity() { return stockQuantity; }
    public boolean isActive() { return active; }
}
