package com.srm.service;

import com.srm.dto.ChangePasswordRequest;
import com.srm.model.User;
import com.srm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.srm.mongo.MongoSyncService;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private MongoSyncService mongoSyncService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setRole(updatedUser.getRole());
        User saved = userRepository.save(user);

        // schedule async sync to MongoDB Atlas (non-blocking)
        try {
            if (mongoSyncService != null) {
                mongoSyncService.syncUpsertUser(saved.getId(), saved.getName(), saved.getEmail(), saved.getPhone(), saved.getRole());
            }
        } catch (Exception ex) {
            System.err.println("Warning: failed to schedule MongoDB sync: " + ex.getMessage());
        }

        return saved;
    }

    public String deleteUser(Long id) {
        userRepository.deleteById(id);
        try {
            if (mongoSyncService != null) {
                mongoSyncService.syncDeleteUser(id);
            }
        } catch (Exception ex) {
            System.err.println("Warning: failed to schedule MongoDB delete: " + ex.getMessage());
        }
        return "User deleted successfully!";
    }

    public String changePassword(String email, ChangePasswordRequest request) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Login required!");
        }

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()
                || request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new RuntimeException("Please fill all fields");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        String storedPassword = user.getPassword();
        boolean passwordMatches = storedPassword != null
                && passwordEncoder.matches(request.getCurrentPassword(), storedPassword);

        if (!passwordMatches) {
            throw new RuntimeException("Current password is incorrect!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password changed successfully!";
    }
}
