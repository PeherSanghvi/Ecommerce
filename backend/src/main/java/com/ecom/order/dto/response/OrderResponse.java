package com.ecom.order.dto.response;

import com.ecom.order.domain.enums.OrderStatus;
import com.ecom.order.domain.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private String id;
    private String idempotencyKey;
    private CustomerSnapshotResponse customer;
    private List<ProductSnapshotResponse> items;
    private AddressResponse shippingAddress;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private long subTotalCents;
    private long discountCents;
    private long totalCents;
    private String notes;
    private boolean syncedToSearch;
    private Instant lastSyncedAt;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
}
