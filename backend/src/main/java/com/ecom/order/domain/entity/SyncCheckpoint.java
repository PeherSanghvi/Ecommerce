package com.ecom.order.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Persists the Change Stream resume token so the sync worker can
 * resume from where it left off after a restart.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sync_checkpoints")
public class SyncCheckpoint {

    @Id
    private String id;          // e.g. "orders_change_stream"

    private String resumeToken; // serialised BsonDocument (hex or JSON)

    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public String getResumeToken() { return resumeToken; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setResumeToken(String resumeToken) { this.resumeToken = resumeToken; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String resumeToken;
        private Instant updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder resumeToken(String resumeToken) { this.resumeToken = resumeToken; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public SyncCheckpoint build() {
            SyncCheckpoint checkpoint = new SyncCheckpoint();
            checkpoint.id = this.id;
            checkpoint.resumeToken = this.resumeToken;
            checkpoint.updatedAt = this.updatedAt;
            return checkpoint;
        }
    }
}
