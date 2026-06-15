package com.srm.mongo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoRequestStatusRepository extends MongoRepository<MongoRequestStatus, String> {
    List<MongoRequestStatus> findByRequestId(Long requestId);
    Optional<MongoRequestStatus> findByStatusId(Long statusId);
    void deleteByRequestId(Long requestId);
}
