package com.ecom.order.repository;

import com.ecom.order.domain.entity.SyncCheckpoint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncCheckpointRepository extends MongoRepository<SyncCheckpoint, String> {
}
