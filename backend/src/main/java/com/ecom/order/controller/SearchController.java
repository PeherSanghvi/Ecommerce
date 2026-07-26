package com.ecom.order.controller;

import com.ecom.order.dto.request.SearchRequest;
import com.ecom.order.dto.response.KpiResponse;
import com.ecom.order.dto.response.SearchResponse;
import com.ecom.order.service.SearchService;
import com.ecom.order.sync.OrderSyncService;
import com.ecom.order.config.OpenSearchIndexInitializer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "OpenSearch-powered order search and analytics")
public class SearchController {

    private final SearchService searchService;
    private final OrderSyncService orderSyncService;
    private final OpenSearchIndexInitializer indexInitializer;

    @GetMapping("/orders")
    @Operation(summary = "Search orders with full-text, filters, date/amount ranges, and aggregations")
    public ResponseEntity<SearchResponse> searchOrders(SearchRequest request) {
        return ResponseEntity.ok(searchService.search(request));
    }

    @GetMapping
    @Operation(summary = "Search products")
    public ResponseEntity<SearchResponse> searchProducts(SearchRequest request) {
        return ResponseEntity.ok(searchService.search(request));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get dashboard KPIs: total orders, revenue, status breakdown")
    public ResponseEntity<KpiResponse> getKpis() {
        return ResponseEntity.ok(searchService.getKpis());
    }

    @PostMapping("/reindex")
    @Operation(summary = "Trigger full reindex of all orders from MongoDB into OpenSearch")
    public ResponseEntity<Map<String, Object>> reindex() throws Exception {
        indexInitializer.recreateIndex();
        int count = orderSyncService.fullReindex();
        return ResponseEntity.ok(Map.of("reindexed", count, "status", "ok"));
    }
}
