package com.srm.service;

import com.srm.dto.ServiceRequestDTO;
import com.srm.model.ServiceRequest;
import com.srm.model.User;
import com.srm.mongo.MongoServiceRequest;
import com.srm.mongo.MongoServiceRequestRepository;
import com.srm.repository.ServiceRequestRepository;
import com.srm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoServiceRequestRepository mongoServiceRequestRepository;

    public ServiceRequest createRequest(ServiceRequestDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        ServiceRequest request = new ServiceRequest();
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCategory(dto.getCategory());
        request.setPriority(dto.getPriority());
        request.setStatus("open");
        request.setUser(user);

        ServiceRequest savedRequest = serviceRequestRepository.save(request);
        saveRequestToMongo(savedRequest);
        return savedRequest;
    }

    public List<ServiceRequest> getAllRequests() {
        return serviceRequestRepository.findAll();
    }

    public List<ServiceRequest> searchRequests(String query, Authentication authentication) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        String searchText = query.trim();
        if (authentication == null || isAdmin(authentication)) {
            return serviceRequestRepository.findByTitleContainingIgnoreCase(searchText);
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return serviceRequestRepository.findByUserAndTitleContainingIgnoreCase(user, searchText);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public ServiceRequest getRequestById(Long id) {
        return serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found!"));
    }

    public List<ServiceRequest> getMyRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return serviceRequestRepository.findByUser(user);
    }

    public ServiceRequest updateStatus(Long id, String status) {
        ServiceRequest request = getRequestById(id);
        request.setStatus(status);
        ServiceRequest savedRequest = serviceRequestRepository.save(request);
        saveRequestToMongo(savedRequest);
        return savedRequest;
    }

    public ServiceRequest updatePriority(Long id, String priority) {
        ServiceRequest request = getRequestById(id);
        request.setPriority(priority);
        ServiceRequest savedRequest = serviceRequestRepository.save(request);
        saveRequestToMongo(savedRequest);
        return savedRequest;
    }

    public ServiceRequest updateRequest(Long id, ServiceRequestDTO dto) {
        ServiceRequest request = getRequestById(id);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCategory(dto.getCategory());
        request.setPriority(dto.getPriority());
        request.setStatus(dto.getStatus());
        ServiceRequest savedRequest = serviceRequestRepository.save(request);
        saveRequestToMongo(savedRequest);
        return savedRequest;
    }

    public String deleteRequest(Long id) {
        serviceRequestRepository.deleteById(id);
        mongoServiceRequestRepository.deleteByRequestId(id);
        return "Request deleted successfully!";
    }

    private void saveRequestToMongo(ServiceRequest request) {
        MongoServiceRequest mongoRequest = mongoServiceRequestRepository
                .findByRequestId(request.getId())
                .orElse(new MongoServiceRequest());

        mongoRequest.setRequestId(request.getId());
        mongoRequest.setTitle(request.getTitle());
        mongoRequest.setDescription(request.getDescription());
        mongoRequest.setCategory(request.getCategory());
        mongoRequest.setPriority(request.getPriority());
        mongoRequest.setStatus(request.getStatus());
        mongoRequest.setUserEmail(request.getUser().getEmail());
        mongoRequest.setCreatedAt(request.getCreatedAt());

        mongoServiceRequestRepository.save(mongoRequest);
    }
}

