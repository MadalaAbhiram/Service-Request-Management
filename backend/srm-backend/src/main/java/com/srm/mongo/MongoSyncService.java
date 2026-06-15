package com.srm.mongo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MongoSyncService {

    private static final Logger logger = LoggerFactory.getLogger(MongoSyncService.class);

    @Autowired(required = false)
    private MongoUserRepository mongoUserRepository;

    @Async
    public void syncUpsertUser(Long userId, String name, String email, String phone, String role) {
        if (mongoUserRepository == null) {
            logger.debug("MongoUserRepository not available; skipping sync for userId={}", userId);
            return;
        }
        try {
            MongoUser mu = mongoUserRepository.findByUserId(userId).orElse(new MongoUser());
            mu.setUserId(userId);
            mu.setName(name);
            mu.setEmail(email);
            mu.setPhone(phone);
            mu.setRole(role);
            mu.setSyncedAt(LocalDateTime.now());
            mongoUserRepository.save(mu);
            logger.info("Synced user to MongoDB: userId={}, email={}", userId, email);
        } catch (Exception ex) {
            logger.error("MongoSyncService.syncUpsertUser failed for userId={}: {}", userId, ex.getMessage());
        }
    }

    @Async
    public void syncDeleteUser(Long userId) {
        if (mongoUserRepository == null) {
            logger.debug("MongoUserRepository not available; skipping delete sync for userId={}", userId);
            return;
        }
        try {
            mongoUserRepository.deleteByUserId(userId);
            logger.info("Deleted user from MongoDB mirror: userId={}", userId);
        } catch (Exception ex) {
            logger.error("MongoSyncService.syncDeleteUser failed for userId={}: {}", userId, ex.getMessage());
        }
    }
}
