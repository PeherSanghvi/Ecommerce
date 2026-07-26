package com.ecom.order.sync;

import com.ecom.order.domain.entity.Order;
import com.ecom.order.domain.entity.ProductSnapshot;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.config.OpenSearchProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.opensearch.client.Request;
import org.opensearch.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderSyncService {

    private static final Logger log = LoggerFactory.getLogger(OrderSyncService.class);

    private final RestClient openSearchRestClient;
    private final OrderRepository orderRepository;
    private final OpenSearchProperties properties;
    private final ObjectMapper objectMapper;

    /**
     * Index a single order into OpenSearch.
     * Idempotent — calling twice with the same order ID just overwrites.
     */
    public boolean indexOrder(Order order) {
        try {
            Map<String, Object> doc = buildDocument(order);
            String json = objectMapper.writeValueAsString(doc);

            String endpoint = "/" + properties.getIndex().getOrders() + "/_doc/" + order.getId();
            Request request = new Request("PUT", endpoint);
            request.setEntity(new StringEntity(json, ContentType.APPLICATION_JSON));
            openSearchRestClient.performRequest(request);

            // Mark as synced in MongoDB
            order.setSyncedToSearch(true);
            order.setLastSyncedAt(Instant.now());
            orderRepository.save(order);

            log.debug("Indexed order: {}", order.getId());
            return true;
        } catch (Exception e) {
            log.warn("Failed to index order {}: {}", order.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * Remove an order from OpenSearch (e.g. on hard delete).
     */
    public void deleteOrder(String orderId) {
        try {
            String endpoint = "/" + properties.getIndex().getOrders() + "/_doc/" + orderId;
            openSearchRestClient.performRequest(new Request("DELETE", endpoint));
            log.debug("Deleted order from index: {}", orderId);
        } catch (Exception e) {
            log.warn("Failed to delete order {} from index: {}", orderId, e.getMessage());
        }
    }

    /**
     * Sync all orders that have syncedToSearch=false (best-effort reconciliation).
     */
    public int syncUnsynced() {
        List<Order> unsynced = orderRepository.findBySyncedToSearchFalse();
        int count = 0;
        for (Order order : unsynced) {
            if (indexOrder(order)) count++;
        }
        if (count > 0) log.info("Reconciliation synced {} orders to OpenSearch", count);
        return count;
    }

    /**
     * Full reindex: sync every order regardless of syncedToSearch flag.
     */
    public int fullReindex() {
        List<Order> all = orderRepository.findAll();
        int count = 0;
        for (Order order : all) {
            if (indexOrder(order)) count++;
        }
        log.info("Full reindex complete: {} orders indexed", count);
        return count;
    }

    // ── document builder ─────────────────────────────────────────────────────

    private Map<String, Object> buildDocument(Order order) {
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("id", order.getId());
        doc.put("idempotencyKey", order.getIdempotencyKey());
        doc.put("status", order.getStatus() != null ? order.getStatus().name() : null);
        doc.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null);
        doc.put("totalCents", order.getTotalCents());
        doc.put("subTotalCents", order.getSubTotalCents());
        doc.put("discountCents", order.getDiscountCents());
        doc.put("notes", order.getNotes());
        doc.put("syncedToSearch", order.isSyncedToSearch());
        doc.put("version", order.getVersion());
        doc.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        doc.put("updatedAt", order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null);

        if (order.getCustomer() != null) {
            Map<String, Object> customer = new LinkedHashMap<>();
            customer.put("customerId", order.getCustomer().getCustomerId());
            customer.put("firstName", order.getCustomer().getFirstName());
            customer.put("lastName", order.getCustomer().getLastName());
            customer.put("email", order.getCustomer().getEmail());
            customer.put("phone", order.getCustomer().getPhone());
            doc.put("customer", customer);
        }

        if (order.getShippingAddress() != null) {
            Map<String, Object> addr = new LinkedHashMap<>();
            addr.put("street", order.getShippingAddress().getStreet());
            addr.put("city", order.getShippingAddress().getCity());
            addr.put("state", order.getShippingAddress().getState());
            addr.put("postalCode", order.getShippingAddress().getPostalCode());
            addr.put("country", order.getShippingAddress().getCountry());
            doc.put("shippingAddress", addr);
        }

        if (order.getItems() != null) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (ProductSnapshot snap : order.getItems()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("productId", snap.getProductId());
                item.put("sku", snap.getSku());
                item.put("title", snap.getTitle());
                item.put("brand", snap.getBrand());
                item.put("category", snap.getCategory());
                item.put("thumbnailUrl", snap.getThumbnailUrl());
                item.put("unitPriceCents", snap.getUnitPriceCents());
                item.put("quantity", snap.getQuantity());
                item.put("lineTotalCents", snap.getLineTotalCents());
                items.add(item);
            }
            doc.put("items", items);
        }

        return doc;
    }
}
