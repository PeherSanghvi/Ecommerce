package com.ecom.order.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.opensearch.client.Request;
import org.opensearch.client.Response;
import org.opensearch.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Creates the OpenSearch index with correct mappings on startup.
 * Uses the low-level RestClient (raw HTTP + JSON) — no RestHighLevelClient needed.
 */
@Component
@RequiredArgsConstructor
public class OpenSearchIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(OpenSearchIndexInitializer.class);

    private final RestClient openSearchRestClient;
    private final OpenSearchProperties properties;

    private static final String ORDERS_MAPPING = """
            {
              "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                  "analyzer": {
                    "custom_analyzer": {
                      "type": "custom",
                      "tokenizer": "standard",
                      "filter": ["lowercase", "asciifolding"]
                    }
                  }
                }
              },
              "mappings": {
                "properties": {
                  "id":              { "type": "keyword" },
                  "status":          { "type": "keyword" },
                  "paymentStatus":   { "type": "keyword" },
                  "totalCents":      { "type": "long" },
                  "subTotalCents":   { "type": "long" },
                  "discountCents":   { "type": "long" },
                  "createdAt":       { "type": "date" },
                  "updatedAt":       { "type": "date" },
                  "version":         { "type": "long" },
                  "syncedToSearch":  { "type": "boolean" },
                  "customer": {
                    "properties": {
                      "customerId":  { "type": "keyword" },
                      "firstName":   { "type": "text", "analyzer": "custom_analyzer", "fields": { "keyword": { "type": "keyword" } } },
                      "lastName":    { "type": "text", "analyzer": "custom_analyzer", "fields": { "keyword": { "type": "keyword" } } },
                      "email":       { "type": "keyword" }
                    }
                  },
                  "items": {
                    "type": "nested",
                    "properties": {
                      "productId":      { "type": "keyword" },
                      "sku":            { "type": "keyword" },
                      "title":          { "type": "text", "analyzer": "custom_analyzer" },
                      "brand":          { "type": "keyword" },
                      "category":       { "type": "keyword" },
                      "unitPriceCents": { "type": "long" },
                      "quantity":       { "type": "integer" },
                      "lineTotalCents": { "type": "long" }
                    }
                  }
                }
              }
            }
            """;

    @EventListener(ApplicationReadyEvent.class)
    public void initIndex() {
        String indexName = properties.getIndex().getOrders();
        try {
            if (!indexExists(indexName)) {
                createIndex(indexName);
                log.info("Created OpenSearch index: {}", indexName);
            } else {
                log.info("OpenSearch index already exists: {}", indexName);
            }
        } catch (Exception e) {
            log.warn("Could not initialise OpenSearch index '{}': {}. Search features will degrade gracefully.",
                    indexName, e.getMessage());
        }
    }

    /** Called by the reindex endpoint to wipe and recreate the index. */
    public void recreateIndex() throws IOException {
        String indexName = properties.getIndex().getOrders();
        if (indexExists(indexName)) {
            deleteIndex(indexName);
            log.info("Deleted OpenSearch index: {}", indexName);
        }
        createIndex(indexName);
        log.info("Recreated OpenSearch index: {}", indexName);
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private boolean indexExists(String indexName) {
        try {
            Response response = openSearchRestClient.performRequest(new Request("HEAD", "/" + indexName));
            return response.getStatusLine().getStatusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    private void createIndex(String indexName) throws IOException {
        Request request = new Request("PUT", "/" + indexName);
        request.setEntity(new StringEntity(ORDERS_MAPPING, ContentType.APPLICATION_JSON));
        openSearchRestClient.performRequest(request);
    }

    private void deleteIndex(String indexName) throws IOException {
        openSearchRestClient.performRequest(new Request("DELETE", "/" + indexName));
    }
}
