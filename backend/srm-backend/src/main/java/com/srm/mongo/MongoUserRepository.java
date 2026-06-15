package com.srm.mongo;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoUserRepository extends MongoRepository<MongoUser, String> {
    Optional<MongoUser> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
