package com.ecom.order.service.impl;

import com.ecom.order.config.OpenSearchProperties;
import com.ecom.order.domain.enums.OrderStatus;
import com.ecom.order.dto.request.SearchRequest;
import com.ecom.order.dto.response.KpiResponse;
import com.ecom.order.dto.response.OrderResponse;
import com.ecom.order.dto.response.SearchResponse;
import com.ecom.order.mapper.OrderMapper;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.service.SearchService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.opensearch.client.Request;
import org.opensearch.client.Response;
import org.opensearch.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

/**
 * SearchService implementation using the low-level RestClient with raw JSON.
 * Falls back to MongoDB when OpenSearch is unavailable.
 */
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchServiceImpl.class);

    private final RestClient openSearchRestClient;
    private final OpenSearchProperties properties;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ObjectMapper objectMapper;

    // ── public API ────────────────────────────────────────────────────────────

    @Override
    public SearchResponse search(SearchRequest req) {
        try {
            return searchFromOpenSearch(req);
        } catch (Exception e) {
            log.warn("OpenSearch search failed, falling back to MongoDB: {}", e.getMessage());
            return fallbackToMongo(req);
        }
    }

    @Override
    public KpiResponse getKpis() {
        try {
            return getKpisFromOpenSearch();
        } catch (Exception e) {
            log.warn("OpenSearch KPI query failed, falling back to MongoDB: {}", e.getMessage());
            return getKpisFromMongo();
        }
    }

    // ── OpenSearch search ─────────────────────────────────────────────────────

    private SearchResponse searchFromOpenSearch(SearchRequest req) throws Exception {
        ObjectNode body = buildSearchBody(req, true);

        String endpoint = "/" + properties.getIndex().getOrders() + "/_search";
        Request request = new Request("POST", endpoint);
        request.setEntity(new StringEntity(objectMapper.writeValueAsString(body), ContentType.APPLICATION_JSON));

        Response response = openSearchRestClient.performRequest(request);
        JsonNode root;
        try (InputStream is = response.getEntity().getContent()) {
            root = objectMapper.readTree(is);
        }

        // Hits
        JsonNode hitsNode = root.path("hits");
        long totalHits = hitsNode.path("total").path("value").asLong(0);
        List<OrderResponse> orders = new ArrayList<>();
        for (JsonNode hit : hitsNode.path("hits")) {
            String orderId = hit.path("_id").asText();
            orderRepository.findById(orderId).ifPresent(o -> orders.add(orderMapper.toResponse(o)));
        }

        // Status counts aggregation
        Map<String, Long> statusCounts = parseTermsAgg(root, "status_counts");

        // Revenue aggregation
        long totalRevenue = (long) root.path("aggregations").path("total_revenue").path("value").asDouble(0);

        return SearchResponse.builder()
                .orders(orders)
                .totalHits(totalHits)
                .page(req.getPage())
                .size(req.getSize())
                .totalPages((int) Math.ceil((double) totalHits / Math.max(1, req.getSize())))
                .statusCounts(statusCounts)
                .totalRevenueCents(totalRevenue)
                .build();
    }

    // ── OpenSearch KPIs ───────────────────────────────────────────────────────

    private KpiResponse getKpisFromOpenSearch() throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.set("query", matchAll());
        body.put("size", 0);

        ObjectNode aggs = objectMapper.createObjectNode();
        ObjectNode statusTerms = objectMapper.createObjectNode();
        ObjectNode statusField = objectMapper.createObjectNode();
        statusField.put("field", "status");
        statusField.put("size", 20);
        statusTerms.set("terms", statusField);
        aggs.set("status_counts", statusTerms);

        ObjectNode revenueSum = objectMapper.createObjectNode();
        ObjectNode revenueField = objectMapper.createObjectNode();
        revenueField.put("field", "totalCents");
        revenueSum.set("sum", revenueField);
        aggs.set("total_revenue", revenueSum);

        body.set("aggs", aggs);

        String endpoint = "/" + properties.getIndex().getOrders() + "/_search";
        Request request = new Request("POST", endpoint);
        request.setEntity(new StringEntity(objectMapper.writeValueAsString(body), ContentType.APPLICATION_JSON));

        Response response = openSearchRestClient.performRequest(request);
        JsonNode root;
        try (InputStream is = response.getEntity().getContent()) {
            root = objectMapper.readTree(is);
        }

        long total = root.path("hits").path("total").path("value").asLong(0);
        Map<String, Long> statusCounts = parseTermsAgg(root, "status_counts");
        long revenue = (long) root.path("aggregations").path("total_revenue").path("value").asDouble(0);

        return KpiResponse.builder()
                .totalOrders(total)
                .totalRevenueCents(revenue)
                .pendingOrders(statusCounts.getOrDefault("PENDING", 0L))
                .deliveredOrders(statusCounts.getOrDefault("DELIVERED", 0L))
                .cancelledOrders(statusCounts.getOrDefault("CANCELLED", 0L))
                .ordersByStatus(statusCounts)
                .build();
    }

    // ── MongoDB fallbacks ─────────────────────────────────────────────────────

    private SearchResponse fallbackToMongo(SearchRequest req) {
        var pageable = org.springframework.data.domain.PageRequest.of(req.getPage(), req.getSize());
        var orders = req.getStatus() != null
                ? orderRepository.findByStatusOrderByCreatedAtDesc(req.getStatus(), pageable)
                : orderRepository.findAll(pageable);

        return SearchResponse.builder()
                .orders(orders.getContent().stream().map(orderMapper::toResponse).toList())
                .totalHits(orders.getTotalElements())
                .page(req.getPage())
                .size(req.getSize())
                .totalPages(orders.getTotalPages())
                .statusCounts(Map.of())
                .totalRevenueCents(0L)
                .build();
    }

    private KpiResponse getKpisFromMongo() {
        long total = orderRepository.count();
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            long count = orderRepository.countByStatus(s);
            if (count > 0) statusCounts.put(s.name(), count);
        }
        return KpiResponse.builder()
                .totalOrders(total)
                .totalRevenueCents(0L)
                .pendingOrders(statusCounts.getOrDefault("PENDING", 0L))
                .deliveredOrders(statusCounts.getOrDefault("DELIVERED", 0L))
                .cancelledOrders(statusCounts.getOrDefault("CANCELLED", 0L))
                .ordersByStatus(statusCounts)
                .build();
    }

    // ── query builder helpers ─────────────────────────────────────────────────

    private ObjectNode buildSearchBody(SearchRequest req, boolean includeAggs) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("from", req.getPage() * req.getSize());
        body.put("size", req.getSize());

        // Sort
        ArrayNode sort = objectMapper.createArrayNode();
        ObjectNode sortField = objectMapper.createObjectNode();
        String sortBy = req.getSortBy() != null ? req.getSortBy() : "createdAt";
        String sortDir = "asc".equalsIgnoreCase(req.getSortDir()) ? "asc" : "desc";
        sortField.put(sortBy, sortDir);
        sort.add(sortField);
        body.set("sort", sort);

        // Bool query
        boolean hasQuery = hasSearchCriteria(req);
        if (hasQuery) {
            ObjectNode boolNode = objectMapper.createObjectNode();
            ArrayNode must = objectMapper.createArrayNode();
            ArrayNode filter = objectMapper.createArrayNode();

            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                ObjectNode multiMatch = objectMapper.createObjectNode();
                ObjectNode mm = objectMapper.createObjectNode();
                mm.put("query", req.getKeyword());
                ArrayNode fields = objectMapper.createArrayNode();
                fields.add("customer.firstName^1.5");
                fields.add("customer.lastName^1.5");
                fields.add("customer.email");
                fields.add("items.title^2");
                fields.add("items.sku^2");
                fields.add("items.brand");
                mm.set("fields", fields);
                mm.put("type", "best_fields");
                mm.put("fuzziness", "AUTO");
                multiMatch.set("multi_match", mm);
                must.add(multiMatch);
            }

            if (req.getStatus() != null) {
                filter.add(termQuery("status", req.getStatus().name()));
            }

            if (req.getDateFrom() != null || req.getDateTo() != null) {
                ObjectNode rangeQuery = objectMapper.createObjectNode();
                ObjectNode rangeField = objectMapper.createObjectNode();
                if (req.getDateFrom() != null) rangeField.put("gte", req.getDateFrom().toString());
                if (req.getDateTo() != null) rangeField.put("lte", req.getDateTo().toString());
                ObjectNode dateRange = objectMapper.createObjectNode();
                dateRange.set("createdAt", rangeField);
                rangeQuery.set("range", dateRange);
                filter.add(rangeQuery);
            }

            if (req.getMinAmountCents() != null || req.getMaxAmountCents() != null) {
                ObjectNode rangeQuery = objectMapper.createObjectNode();
                ObjectNode rangeField = objectMapper.createObjectNode();
                if (req.getMinAmountCents() != null) rangeField.put("gte", req.getMinAmountCents());
                if (req.getMaxAmountCents() != null) rangeField.put("lte", req.getMaxAmountCents());
                ObjectNode amountRange = objectMapper.createObjectNode();
                amountRange.set("totalCents", rangeField);
                rangeQuery.set("range", amountRange);
                filter.add(rangeQuery);
            }

            if (req.getCustomerName() != null && !req.getCustomerName().isBlank()) {
                ObjectNode multiMatch = objectMapper.createObjectNode();
                ObjectNode mm = objectMapper.createObjectNode();
                mm.put("query", req.getCustomerName());
                ArrayNode fields = objectMapper.createArrayNode();
                fields.add("customer.firstName");
                fields.add("customer.lastName");
                mm.set("fields", fields);
                mm.put("type", "cross_fields");
                multiMatch.set("multi_match", mm);
                filter.add(multiMatch);
            }

            if (req.getProductTitle() != null && !req.getProductTitle().isBlank()) {
                filter.add(nestedMatchQuery("items", "items.title", req.getProductTitle()));
            }

            if (req.getSku() != null && !req.getSku().isBlank()) {
                filter.add(nestedTermQuery("items", "items.sku", req.getSku()));
            }

            if (!must.isEmpty()) boolNode.set("must", must);
            if (!filter.isEmpty()) boolNode.set("filter", filter);

            ObjectNode queryNode = objectMapper.createObjectNode();
            queryNode.set("bool", boolNode);
            body.set("query", queryNode);
        } else {
            body.set("query", matchAll());
        }

        if (includeAggs) {
            ObjectNode aggs = objectMapper.createObjectNode();

            ObjectNode statusTerms = objectMapper.createObjectNode();
            ObjectNode statusField = objectMapper.createObjectNode();
            statusField.put("field", "status");
            statusField.put("size", 20);
            statusTerms.set("terms", statusField);
            aggs.set("status_counts", statusTerms);

            ObjectNode revenueSum = objectMapper.createObjectNode();
            ObjectNode revenueField = objectMapper.createObjectNode();
            revenueField.put("field", "totalCents");
            revenueSum.set("sum", revenueField);
            aggs.set("total_revenue", revenueSum);

            body.set("aggs", aggs);
        }

        return body;
    }

    private boolean hasSearchCriteria(SearchRequest req) {
        return (req.getKeyword() != null && !req.getKeyword().isBlank())
                || req.getStatus() != null
                || req.getDateFrom() != null
                || req.getDateTo() != null
                || req.getMinAmountCents() != null
                || req.getMaxAmountCents() != null
                || (req.getCustomerName() != null && !req.getCustomerName().isBlank())
                || (req.getProductTitle() != null && !req.getProductTitle().isBlank())
                || (req.getSku() != null && !req.getSku().isBlank());
    }

    private ObjectNode matchAll() {
        ObjectNode node = objectMapper.createObjectNode();
        node.set("match_all", objectMapper.createObjectNode());
        return node;
    }

    private ObjectNode termQuery(String field, String value) {
        ObjectNode term = objectMapper.createObjectNode();
        ObjectNode fieldNode = objectMapper.createObjectNode();
        fieldNode.put(field, value);
        term.set("term", fieldNode);
        return term;
    }

    private ObjectNode nestedMatchQuery(String path, String field, String value) {
        ObjectNode matchNode = objectMapper.createObjectNode();
        ObjectNode matchField = objectMapper.createObjectNode();
        matchField.put(field, value);
        matchNode.set("match", matchField);

        ObjectNode nestedNode = objectMapper.createObjectNode();
        ObjectNode nested = objectMapper.createObjectNode();
        nested.put("path", path);
        nested.set("query", matchNode);
        nested.put("score_mode", "none");
        nestedNode.set("nested", nested);
        return nestedNode;
    }

    private ObjectNode nestedTermQuery(String path, String field, String value) {
        ObjectNode termNode = objectMapper.createObjectNode();
        ObjectNode termField = objectMapper.createObjectNode();
        termField.put(field, value);
        termNode.set("term", termField);

        ObjectNode nestedNode = objectMapper.createObjectNode();
        ObjectNode nested = objectMapper.createObjectNode();
        nested.put("path", path);
        nested.set("query", termNode);
        nested.put("score_mode", "none");
        nestedNode.set("nested", nested);
        return nestedNode;
    }

    private Map<String, Long> parseTermsAgg(JsonNode root, String aggName) {
        Map<String, Long> result = new LinkedHashMap<>();
        JsonNode buckets = root.path("aggregations").path(aggName).path("buckets");
        if (buckets.isArray()) {
            for (JsonNode bucket : buckets) {
                result.put(bucket.path("key").asText(), bucket.path("doc_count").asLong(0));
            }
        }
        return result;
    }
}
