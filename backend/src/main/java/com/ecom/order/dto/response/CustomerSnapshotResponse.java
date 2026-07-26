package com.ecom.order.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerSnapshotResponse {
    private String customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
}
