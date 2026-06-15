package com.srm.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoConnectionEventRepository extends MongoRepository<MongoConnectionEvent, String> {
}
