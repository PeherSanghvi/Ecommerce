package com.ecom.order.domain.entity;

import com.ecom.order.domain.enums.OrderStatus;
import com.ecom.order.domain.enums.PaymentStatus;
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
 * Order aggregate root.
 *
 * Design decisions:
 * - Customer and product data are embedded as snapshots (denormalised) so the order
 *   record is self-contained and immune to future catalogue changes.
 * - All monetary values are stored in minor currency units (cents).
 * - Optimistic locking via @Version prevents lost-update concurrency bugs.
 * - idempotencyKey prevents duplicate checkout submissions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
@CompoundIndexes({
        @CompoundIndex(name = "idx_order_status_created",
                def = "{'status': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "idx_order_customer_created",
                def = "{'customer.customerId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "idx_order_synced_status",
                def = "{'syncedToSearch': 1, 'status': 1}")
})
public class Order {

    @Id
    private String id;

    /** Unique key supplied by the client to prevent duplicate orders */
    @Indexed(unique = true, sparse = true)
    private String idempotencyKey;

    private CustomerSnapshot customer;
    private List<ProductSnapshot> items;
    private Address shippingAddress;

    private OrderStatus status;
    private PaymentStatus paymentStatus;

    /** Sub-total before discount, in cents */
    private long subTotalCents;

    /** Total discount applied, in cents */
    private long discountCents;

    /** Final amount charged, in cents */
    private long totalCents;

    /** Notes or special instructions */
    private String notes;

    /** Whether this order has been synced to OpenSearch */
    private boolean syncedToSearch;

    /** Last time this order was successfully synced */
    private Instant lastSyncedAt;

    /** Optimistic locking version */
    @Version
    private Long version;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public CustomerSnapshot getCustomer() { return customer; }
    public List<ProductSnapshot> getItems() { return items; }
    public Address getShippingAddress() { return shippingAddress; }
    public OrderStatus getStatus() { return status; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public long getSubTotalCents() { return subTotalCents; }
    public long getDiscountCents() { return discountCents; }
    public long getTotalCents() { return totalCents; }
    public String getNotes() { return notes; }
    public boolean isSyncedToSearch() { return syncedToSearch; }
    public Instant getLastSyncedAt() { return lastSyncedAt; }
    public Long getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setStatus(OrderStatus status) { this.status = status; }
    public void setSyncedToSearch(boolean syncedToSearch) { this.syncedToSearch = syncedToSearch; }
    public void setLastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String idempotencyKey;
        private CustomerSnapshot customer;
        private List<ProductSnapshot> items;
        private Address shippingAddress;
        private OrderStatus status;
        private PaymentStatus paymentStatus;
        private long subTotalCents;
        private long discountCents;
        private long totalCents;
        private String notes;
        private boolean syncedToSearch;
        private Instant lastSyncedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public Builder customer(CustomerSnapshot customer) { this.customer = customer; return this; }
        public Builder items(List<ProductSnapshot> items) { this.items = items; return this; }
        public Builder shippingAddress(Address shippingAddress) { this.shippingAddress = shippingAddress; return this; }
        public Builder status(OrderStatus status) { this.status = status; return this; }
        public Builder paymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public Builder subTotalCents(long subTotalCents) { this.subTotalCents = subTotalCents; return this; }
        public Builder discountCents(long discountCents) { this.discountCents = discountCents; return this; }
        public Builder totalCents(long totalCents) { this.totalCents = totalCents; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder syncedToSearch(boolean syncedToSearch) { this.syncedToSearch = syncedToSearch; return this; }
        public Builder lastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; return this; }

        public Order build() {
            Order order = new Order();
            order.id = this.id;
            order.idempotencyKey = this.idempotencyKey;
            order.customer = this.customer;
            order.items = this.items;
            order.shippingAddress = this.shippingAddress;
            order.status = this.status;
            order.paymentStatus = this.paymentStatus;
            order.subTotalCents = this.subTotalCents;
            order.discountCents = this.discountCents;
            order.totalCents = this.totalCents;
            order.notes = this.notes;
            order.syncedToSearch = this.syncedToSearch;
            order.lastSyncedAt = this.lastSyncedAt;
            return order;
        }
    }
}
