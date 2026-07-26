package com.ecom.order.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * Product catalogue entry.
 * Prices stored in minor currency units (cents) — never floating-point.
 * Optimistic locking via @Version.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
@CompoundIndexes({
        @CompoundIndex(name = "idx_product_category_active", def = "{'category': 1, 'active': 1}"),
        @CompoundIndex(name = "idx_product_brand_category",  def = "{'brand': 1, 'category': 1}")
})
public class Product {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sku;

    private String title;
    private String description;
    private String brand;
    private String category;
    private String thumbnailUrl;
    private List<String> imageUrls;

    /** Price in minor currency units (cents) */
    private long priceCents;

    /** Discount percentage 0-100 */
    private double discountPercentage;

    /** Effective price after discount, in cents */
    private long effectivePriceCents;

    private int stockQuantity;
    private double rating;
    private boolean active;

    @Version
    private Long version;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public String getSku() { return sku; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getBrand() { return brand; }
    public String getCategory() { return category; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public List<String> getImageUrls() { return imageUrls; }
    public long getPriceCents() { return priceCents; }
    public double getDiscountPercentage() { return discountPercentage; }
    public long getEffectivePriceCents() { return effectivePriceCents; }
    public int getStockQuantity() { return stockQuantity; }
    public double getRating() { return rating; }
    public boolean isActive() { return active; }
    public Long getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public void setEffectivePriceCents(long effectivePriceCents) { this.effectivePriceCents = effectivePriceCents; }
    public void setActive(boolean active) { this.active = active; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
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

        public Builder id(String id) { this.id = id; return this; }
        public Builder sku(String sku) { this.sku = sku; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder brand(String brand) { this.brand = brand; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder thumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; return this; }
        public Builder imageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; return this; }
        public Builder priceCents(long priceCents) { this.priceCents = priceCents; return this; }
        public Builder discountPercentage(double discountPercentage) { this.discountPercentage = discountPercentage; return this; }
        public Builder effectivePriceCents(long effectivePriceCents) { this.effectivePriceCents = effectivePriceCents; return this; }
        public Builder stockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; return this; }
        public Builder rating(double rating) { this.rating = rating; return this; }
        public Builder active(boolean active) { this.active = active; return this; }

        public Product build() {
            Product product = new Product();
            product.id = this.id;
            product.sku = this.sku;
            product.title = this.title;
            product.description = this.description;
            product.brand = this.brand;
            product.category = this.category;
            product.thumbnailUrl = this.thumbnailUrl;
            product.imageUrls = this.imageUrls;
            product.priceCents = this.priceCents;
            product.discountPercentage = this.discountPercentage;
            product.effectivePriceCents = this.effectivePriceCents;
            product.stockQuantity = this.stockQuantity;
            product.rating = this.rating;
            product.active = this.active;
            return product;
        }
    }
}
