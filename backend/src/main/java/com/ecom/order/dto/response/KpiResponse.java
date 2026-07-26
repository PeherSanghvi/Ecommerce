package com.ecom.order.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
public class KpiResponse {
    private long totalOrders;
    private long totalRevenueCents;
    private long pendingOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private Map<String, Long> ordersByStatus;

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalOrders;
        private long totalRevenueCents;
        private long pendingOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        private Map<String, Long> ordersByStatus;

        public Builder totalOrders(long totalOrders) { this.totalOrders = totalOrders; return this; }
        public Builder totalRevenueCents(long totalRevenueCents) { this.totalRevenueCents = totalRevenueCents; return this; }
        public Builder pendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; return this; }
        public Builder deliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; return this; }
        public Builder cancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; return this; }
        public Builder ordersByStatus(Map<String, Long> ordersByStatus) { this.ordersByStatus = ordersByStatus; return this; }

        public KpiResponse build() {
            KpiResponse response = new KpiResponse();
            response.totalOrders = this.totalOrders;
            response.totalRevenueCents = this.totalRevenueCents;
            response.pendingOrders = this.pendingOrders;
            response.deliveredOrders = this.deliveredOrders;
            response.cancelledOrders = this.cancelledOrders;
            response.ordersByStatus = this.ordersByStatus;
            return response;
        }
    }
}
