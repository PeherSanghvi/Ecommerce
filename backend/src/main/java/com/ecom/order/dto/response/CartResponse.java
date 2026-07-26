package com.ecom.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private String id;
    private String userId;
    private List<CartItemResponse> items;
    private long totalCents;
    private int totalItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private String productId;
        private String sku;
        private String title;
        private String thumbnailUrl;
        private long unitPriceCents;
        private int quantity;
        private long lineTotalCents;
    }
}
