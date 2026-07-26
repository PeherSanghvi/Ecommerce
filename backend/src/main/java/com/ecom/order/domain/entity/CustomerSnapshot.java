package com.ecom.order.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Immutable snapshot of customer data captured at order time.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSnapshot {

    private String customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    public String getCustomerId() { return customerId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String customerId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;

        public Builder customerId(String customerId) { this.customerId = customerId; return this; }
        public Builder firstName(String firstName) { this.firstName = firstName; return this; }
        public Builder lastName(String lastName) { this.lastName = lastName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }

        public CustomerSnapshot build() {
            CustomerSnapshot snapshot = new CustomerSnapshot();
            snapshot.customerId = this.customerId;
            snapshot.firstName = this.firstName;
            snapshot.lastName = this.lastName;
            snapshot.email = this.email;
            snapshot.phone = this.phone;
            return snapshot;
        }
    }
}
