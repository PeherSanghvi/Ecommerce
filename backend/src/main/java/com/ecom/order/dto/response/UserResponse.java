package com.ecom.order.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private AddressResponse address;
    private String username;
    private boolean active;
    private Instant createdAt;
}
