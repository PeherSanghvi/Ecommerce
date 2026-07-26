package com.ecom.order.sync;

import com.ecom.order.domain.entity.Order;
import com.ecom.order.domain.entity.SyncCheckpoint;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.repository.SyncCheckpointRepository;
import com.mongodb.client.ChangeStreamIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.changestream.ChangeStreamDocument;
import com.mongodb.client.model.changestream.FullDocument;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.BsonDocument;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
@RequiredArgsConstructor
public class ChangeStreamWorker {

    private static final Logger log = LoggerFactory.getLogger(ChangeStreamWorker.class);
    private static final String CHECKPOINT_ID = "orders_change_stream";

    private final MongoTemplate mongoTemplate;
    private final SyncCheckpointRepository checkpointRepository;
    private final OrderSyncService orderSyncService;
    private final OrderRepository orderRepository;

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017/ecomdb?replicaSet=rs0}")
    private String mongoUri;

    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "change-stream-worker");
        t.setDaemon(true);
        return t;
    });

    private final AtomicBoolean running = new AtomicBoolean(false);

    @PostConstruct
    public void start() {
        running.set(true);
        executor.submit(this::runLoop);
        log.info("Change stream worker started");
    }

    @PreDestroy
    public void stop() {
        running.set(false);
        executor.shutdownNow();
        log.info("Change stream worker stopped");
    }

    private void runLoop() {
        while (running.get()) {
            try {
                watchOrders();
            } catch (Exception e) {
                if (running.get()) {
                    log.warn("Change stream error, retrying in 5s: {}", e.getMessage());
                    sleep(5_000);
                }
            }
        }
    }

    private void watchOrders() {
        MongoCollection<Document> collection = mongoTemplate.getDb()
                .getCollection("orders");

        ChangeStreamIterable<Document> stream = buildStream(collection);
        log.info("Change stream opened on orders collection");

        for (ChangeStreamDocument<Document> change : stream) {
            if (!running.get()) break;

            String operationType = change.getOperationTypeString();
            log.debug("Change event: operation={}", operationType);

            // Persist resume token so we can resume after restart
            if (change.getResumeToken() != null) {
                saveCheckpoint(change.getResumeToken().toJson());
            }

            if ("insert".equals(operationType) || "update".equals(operationType) || "replace".equals(operationType)) {
                Document fullDoc = change.getFullDocument();
                if (fullDoc != null) {
                    String orderId = fullDoc.getObjectId("_id").toHexString();
                    orderRepository.findById(orderId).ifPresent(order -> {
                        orderSyncService.indexOrder(order);
                    });
                }
            } else if ("delete".equals(operationType) && change.getDocumentKey() != null) {
                String orderId = change.getDocumentKey().getObjectId("_id").getValue().toHexString();
                orderSyncService.deleteOrder(orderId);
            }
        }
    }

    private ChangeStreamIterable<Document> buildStream(MongoCollection<Document> collection) {
        ChangeStreamIterable<Document> stream = collection.watch()
                .fullDocument(FullDocument.UPDATE_LOOKUP);

        // Resume from last known token if available
        checkpointRepository.findById(CHECKPOINT_ID).ifPresent(cp -> {
            try {
                BsonDocument token = BsonDocument.parse(cp.getResumeToken());
                stream.resumeAfter(token);
                log.info("Resuming change stream from saved token");
            } catch (Exception e) {
                log.warn("Could not restore resume token, starting fresh: {}", e.getMessage());
            }
        });

        return stream;
    }

    private void saveCheckpoint(String tokenJson) {
        try {
            SyncCheckpoint checkpoint = checkpointRepository.findById(CHECKPOINT_ID)
                    .orElse(SyncCheckpoint.builder().id(CHECKPOINT_ID).build());
            checkpoint.setResumeToken(tokenJson);
            checkpointRepository.save(checkpoint);
        } catch (Exception e) {
            log.warn("Could not save checkpoint: {}", e.getMessage());
        }
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
    }
}
