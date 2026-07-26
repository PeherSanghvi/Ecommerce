package com.ecom.order.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class SearchResponse {
    private List<OrderResponse> orders;
    private long totalHits;
    private int page;
    private int size;
    private int totalPages;
    private Map<String, Long> statusCounts;
    private long totalRevenueCents;

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private List<OrderResponse> orders;
        private long totalHits;
        private int page;
        private int size;
        private int totalPages;
        private Map<String, Long> statusCounts;
        private long totalRevenueCents;

        public Builder orders(List<OrderResponse> orders) { this.orders = orders; return this; }
        public Builder totalHits(long totalHits) { this.totalHits = totalHits; return this; }
        public Builder page(int page) { this.page = page; return this; }
        public Builder size(int size) { this.size = size; return this; }
        public Builder totalPages(int totalPages) { this.totalPages = totalPages; return this; }
        public Builder statusCounts(Map<String, Long> statusCounts) { this.statusCounts = statusCounts; return this; }
        public Builder totalRevenueCents(long totalRevenueCents) { this.totalRevenueCents = totalRevenueCents; return this; }

        public SearchResponse build() {
            SearchResponse response = new SearchResponse();
            response.orders = this.orders;
            response.totalHits = this.totalHits;
            response.page = this.page;
            response.size = this.size;
            response.totalPages = this.totalPages;
            response.statusCounts = this.statusCounts;
            response.totalRevenueCents = this.totalRevenueCents;
            return response;
        }
    }
}
