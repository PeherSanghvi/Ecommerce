package com.ecom.order.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    public String getStreet() { return street; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getPostalCode() { return postalCode; }
    public String getCountry() { return country; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String street;
        private String city;
        private String state;
        private String postalCode;
        private String country;

        public Builder street(String street) { this.street = street; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder state(String state) { this.state = state; return this; }
        public Builder postalCode(String postalCode) { this.postalCode = postalCode; return this; }
        public Builder country(String country) { this.country = country; return this; }

        public Address build() {
            Address address = new Address();
            address.street = this.street;
            address.city = this.city;
            address.state = this.state;
            address.postalCode = this.postalCode;
            address.country = this.country;
            return address;
        }
    }
}
