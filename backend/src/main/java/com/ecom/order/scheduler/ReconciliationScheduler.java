package com.ecom.order.scheduler;

import com.ecom.order.sync.OrderSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Periodic reconciliation: re-syncs any orders that failed Change Stream sync.
 * Runs every 5 minutes. Idempotent — safe to call multiple times.
 */
@Component
@RequiredArgsConstructor
public class ReconciliationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReconciliationScheduler.class);

    private final OrderSyncService orderSyncService;

    @Scheduled(cron = "${app.sync.reconciliation.cron:0 */5 * * * *}")
    public void reconcile() {
        log.debug("Reconciliation scheduler triggered");
        try {
            int synced = orderSyncService.syncUnsynced();
            if (synced > 0) {
                log.info("Reconciliation synced {} orders", synced);
            }
        } catch (Exception e) {
            log.warn("Reconciliation failed: {}", e.getMessage());
        }
    }
}
