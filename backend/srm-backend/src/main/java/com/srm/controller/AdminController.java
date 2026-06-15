package com.srm.controller;

import com.srm.mongo.MongoRequestStatusService;
import com.srm.mongo.MongoSyncService;
import com.srm.model.RequestStatus;
import com.srm.model.User;
import com.srm.repository.RequestStatusRepository;
import com.srm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private MongoSyncService mongoSyncService;

    @Autowired(required = false)
    private MongoRequestStatusService mongoRequestStatusService;

    @Autowired(required = false)
    private com.srm.mongo.MongoUserRepository mongoUserRepository;

    @Autowired(required = false)
    private com.srm.mongo.MongoRequestStatusRepository mongoRequestStatusRepository;

    @Autowired
    private RequestStatusRepository requestStatusRepository;

    @PostMapping("/sync-mongo-users")
    public ResponseEntity<String> syncAllUsersToMongo() {
        String allowed = System.getenv("ENABLE_MONGO_SYNC");
        if (allowed == null || !(allowed.equalsIgnoreCase("true") || allowed.equals("1"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Mongo sync is disabled. Set ENABLE_MONGO_SYNC=true to enable.");
        }

        if (mongoSyncService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("MongoSyncService not available in this runtime.");
        }

        List<User> users = userRepository.findAll();
        for (User u : users) {
            try {
                mongoSyncService.syncUpsertUser(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole());
            } catch (Exception ex) {
                // continue scheduling others
            }
        }

        return ResponseEntity.ok("Scheduled sync for " + users.size() + " users.");
    }

    @PostMapping("/list-mongo-users")
    public ResponseEntity<Object> listMongoUsers() {
        String allowed = System.getenv("ENABLE_MONGO_SYNC");
        if (allowed == null || !(allowed.equalsIgnoreCase("true") || allowed.equals("1"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Mongo access disabled. Set ENABLE_MONGO_SYNC=true to enable.");
        }
        if (mongoUserRepository == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("MongoUserRepository not available in this runtime.");
        }

        try {
            return ResponseEntity.ok(mongoUserRepository.findAll());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }
    }

    @GetMapping("/sync-request-status")
    public ResponseEntity<String> syncAllRequestStatusToMongo() {
        String allowed = System.getenv("ENABLE_MONGO_SYNC");
        if (allowed == null || !(allowed.equalsIgnoreCase("true") || allowed.equals("1"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Mongo sync is disabled. Set ENABLE_MONGO_SYNC=true to enable.");
        }
        if (mongoRequestStatusService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("MongoRequestStatusService not available in this runtime.");
        }

        List<RequestStatus> statuses = requestStatusRepository.findAll();
        mongoRequestStatusService.syncStatuses(statuses);
        return ResponseEntity.ok("Scheduled sync for " + statuses.size() + " request status records.");
    }

    @GetMapping("/list-mongo-request-status")
    public ResponseEntity<Object> listMongoRequestStatus() {
        String allowed = System.getenv("ENABLE_MONGO_SYNC");
        if (allowed == null || !(allowed.equalsIgnoreCase("true") || allowed.equals("1"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Mongo access disabled. Set ENABLE_MONGO_SYNC=true to enable.");
        }
        if (mongoRequestStatusRepository == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("MongoRequestStatusRepository not available in this runtime.");
        }

        try {
            return ResponseEntity.ok(mongoRequestStatusRepository.findAll());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }
    }
}
