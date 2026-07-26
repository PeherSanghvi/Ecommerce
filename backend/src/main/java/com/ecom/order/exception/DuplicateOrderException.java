package com.ecom.order.exception;

public class DuplicateOrderException extends RuntimeException {
    public DuplicateOrderException(String idempotencyKey) {
        super("Order with idempotency key already exists: " + idempotencyKey);
    }
}
