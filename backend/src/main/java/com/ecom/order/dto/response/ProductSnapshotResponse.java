package com.ecom.order.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductSnapshotResponse {
    private String productId;
    private String sku;
    private String title;
    private String brand;
    private String category;
    private String thumbnailUrl;
    private long unitPriceCents;
    private int quantity;
    private long lineTotalCents;
}
