package com.srm.service;

import com.srm.dto.LoginRequest;
import com.srm.dto.LoginResponse;
import com.srm.model.User;
import com.srm.repository.UserRepository;
import com.srm.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.srm.mongo.MongoSyncService;
import com.srm.mongo.MongoUserRepository;
import com.srm.mongo.MongoUser;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private MongoSyncService mongoSyncService;
    @Autowired(required = false)
    private MongoUserRepository mongoUserRepository;

    public String register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return "Email already exists!";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);

        // If immediate sync testing is enabled, write to Mongo synchronously so we can observe it.
        String immediate = System.getenv("ENABLE_MONGO_SYNC_IMMEDIATE");
        if (immediate != null && (immediate.equalsIgnoreCase("true") || immediate.equals("1"))) {
            if (mongoUserRepository != null) {
                try {
                    MongoUser mu = new MongoUser();
                    mu.setUserId(saved.getId());
                    mu.setName(saved.getName());
                    mu.setEmail(saved.getEmail());
                    mu.setPhone(saved.getPhone());
                    mu.setRole(saved.getRole());
                    mu.setSyncedAt(LocalDateTime.now());
                    mongoUserRepository.save(mu);
                    System.out.println("Immediate Mongo sync succeeded for userId=" + saved.getId());
                } catch (Exception ex) {
                    System.err.println("Immediate Mongo sync failed: " + ex.getMessage());
                }
            } else {
                System.err.println("Immediate Mongo sync requested but MongoUserRepository not available.");
            }
        } else {
            // Fire-and-forget: sync a mirror to MongoDB Atlas in background
            try {
                if (mongoSyncService != null) {
                    mongoSyncService.syncUpsertUser(saved.getId(), saved.getName(), saved.getEmail(), saved.getPhone(), saved.getRole());
                }
            } catch (Exception ex) {
                System.err.println("Warning: failed to schedule MongoDB sync: " + ex.getMessage());
            }
        }
        return "User registered successfully!";
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        String storedPassword = user.getPassword();
        boolean passwordMatches = storedPassword != null
                && passwordEncoder.matches(request.getPassword(), storedPassword);

        if (!passwordMatches) {
            throw new RuntimeException("Invalid password!");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getRole(), user.getName(), user.getPhone());
    }
}
