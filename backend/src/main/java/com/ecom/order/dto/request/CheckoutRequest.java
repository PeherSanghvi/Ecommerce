package com.ecom.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CheckoutRequest {

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<CheckoutItemRequest> items;

    @Valid
    private AddressRequest shippingAddress;

    private String notes;

    /** Client-supplied idempotency key to prevent duplicate orders */
    private String idempotencyKey;

    public String getCustomerId() {
        return customerId;
    }

    public List<CheckoutItemRequest> getItems() {
        return items;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public AddressRequest getShippingAddress() {
        return shippingAddress;
    }

    public String getNotes() {
        return notes;
    }
}
