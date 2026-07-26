package com.ecom.order.controller;

import com.ecom.order.config.OpenSearchProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.opensearch.client.Request;
import org.opensearch.client.Response;
import org.opensearch.client.RestClient;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "Service health checks")
public class HealthController {

    private final MongoTemplate mongoTemplate;
    private final RestClient openSearchRestClient;
    private final OpenSearchProperties properties;

    @GetMapping
    @Operation(summary = "Check health of MongoDB, OpenSearch, and application")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("timestamp", Instant.now().toString());
        status.put("application", "UP");
        status.put("mongodb", checkMongo());
        status.put("opensearch", checkOpenSearch());
        return ResponseEntity.ok(status);
    }

    private String checkMongo() {
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            return "UP";
        } catch (Exception e) {
            return "DOWN: " + e.getMessage();
        }
    }

    private String checkOpenSearch() {
        try {
            Response response = openSearchRestClient.performRequest(new Request("GET", "/"));
            int statusCode = response.getStatusLine().getStatusCode();
            return statusCode == 200 ? "UP" : "DOWN (HTTP " + statusCode + ")";
        } catch (Exception e) {
            return "DOWN: " + e.getMessage();
        }
    }
}
