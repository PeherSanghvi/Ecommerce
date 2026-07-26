package com.ecom.order.dto.request;

import com.ecom.order.domain.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    /** Must match current document version to prevent stale updates */
    @NotNull(message = "Version is required for optimistic locking")
    private Long version;

    public OrderStatus getStatus() { return status; }
    public Long getVersion() { return version; }
}
