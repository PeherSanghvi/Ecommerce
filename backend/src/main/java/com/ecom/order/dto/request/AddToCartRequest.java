package com.ecom.order.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {
    
    @NotBlank(message = "Product ID is required")
    private String productId;
    
    @NotBlank(message = "SKU is required")
    private String sku;
    
    private String title;
    
    private String thumbnailUrl;
    
    @NotNull(message = "Unit price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Long unitPriceCents;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
