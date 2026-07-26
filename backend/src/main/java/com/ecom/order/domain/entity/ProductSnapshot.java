package com.ecom.order.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Immutable snapshot of product data captured at order time.
 * Prices stored as integer minor units (cents).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSnapshot {

    private String productId;
    private String sku;
    private String title;
    private String brand;
    private String category;
    private String thumbnailUrl;

    /** Unit price in minor currency units (cents) at time of order */
    private long unitPriceCents;

    private int quantity;

    /** Line total = unitPriceCents * quantity */
    private long lineTotalCents;

    public String getProductId() { return productId; }
    public String getSku() { return sku; }
    public String getTitle() { return title; }
    public String getBrand() { return brand; }
    public String getCategory() { return category; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public long getUnitPriceCents() { return unitPriceCents; }
    public int getQuantity() { return quantity; }
    public long getLineTotalCents() { return lineTotalCents; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String productId;
        private String sku;
        private String title;
        private String brand;
        private String category;
        private String thumbnailUrl;
        private long unitPriceCents;
        private int quantity;
        private long lineTotalCents;

        public Builder productId(String productId) { this.productId = productId; return this; }
        public Builder sku(String sku) { this.sku = sku; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder brand(String brand) { this.brand = brand; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder thumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; return this; }
        public Builder unitPriceCents(long unitPriceCents) { this.unitPriceCents = unitPriceCents; return this; }
        public Builder quantity(int quantity) { this.quantity = quantity; return this; }
        public Builder lineTotalCents(long lineTotalCents) { this.lineTotalCents = lineTotalCents; return this; }

        public ProductSnapshot build() {
            ProductSnapshot snapshot = new ProductSnapshot();
            snapshot.productId = this.productId;
            snapshot.sku = this.sku;
            snapshot.title = this.title;
            snapshot.brand = this.brand;
            snapshot.category = this.category;
            snapshot.thumbnailUrl = this.thumbnailUrl;
            snapshot.unitPriceCents = this.unitPriceCents;
            snapshot.quantity = this.quantity;
            snapshot.lineTotalCents = this.lineTotalCents;
            return snapshot;
        }
    }
}
