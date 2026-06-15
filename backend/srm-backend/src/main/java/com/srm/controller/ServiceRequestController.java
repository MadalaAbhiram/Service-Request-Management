package com.srm.controller;

import com.srm.dto.ServiceRequestDTO;
import com.srm.model.ServiceRequest;
import com.srm.service.ServiceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @PostMapping
    public ResponseEntity<ServiceRequest> createRequest(
            @RequestBody ServiceRequestDTO dto,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "guest@localhost";
        return ResponseEntity.ok(serviceRequestService.createRequest(dto, email));
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        return ResponseEntity.ok(serviceRequestService.getAllRequests());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ServiceRequest>> searchRequests(
            @RequestParam String query,
            Authentication authentication) {
        return ResponseEntity.ok(serviceRequestService.searchRequests(query, authentication));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ServiceRequest>> getMyRequests(
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(serviceRequestService.getAllRequests());
        }
        String email = authentication.getName();
        return ResponseEntity.ok(serviceRequestService.getMyRequests(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getRequestById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequest> updateRequest(
            @PathVariable Long id,
            @RequestBody ServiceRequestDTO dto) {
        return ResponseEntity.ok(serviceRequestService.updateRequest(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(serviceRequestService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<ServiceRequest> updatePriority(
            @PathVariable Long id,
            @RequestParam String priority) {
        return ResponseEntity.ok(serviceRequestService.updatePriority(id, priority));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.deleteRequest(id));
    }
}


