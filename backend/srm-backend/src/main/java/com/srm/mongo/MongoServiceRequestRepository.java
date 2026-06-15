package com.srm.mongo;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoServiceRequestRepository extends MongoRepository<MongoServiceRequest, String> {
    Optional<MongoServiceRequest> findByRequestId(Long requestId);
    void deleteByRequestId(Long requestId);
}
