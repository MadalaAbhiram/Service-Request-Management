package com.srm.service;

import com.srm.dto.ServiceRequestDTO;
import com.srm.model.RequestStatus;
import com.srm.model.ServiceRequest;
import com.srm.model.User;
import com.srm.mongo.MongoRequestStatusService;
import com.srm.mongo.MongoServiceRequest;
import com.srm.mongo.MongoServiceRequestRepository;
import com.srm.repository.RequestStatusRepository;
import com.srm.repository.ServiceRequestRepository;
import com.srm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoServiceRequestRepository mongoServiceRequestRepository;

    @Autowired
    private RequestStatusRepository requestStatusRepository;

    @Autowired(required = false)
    private MongoRequestStatusService mongoRequestStatusService;

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
        createStatusHistory(savedRequest, "open", user);
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

    public ServiceRequest updateStatus(Long id, String status, Authentication authentication) {
        ServiceRequest request = getRequestById(id);
        User updater = null;
        if (authentication != null) {
            updater = userRepository.findByEmail(authentication.getName())
                    .orElse(null);
        }

        request.setStatus(status);
        ServiceRequest savedRequest = serviceRequestRepository.save(request);
        saveRequestToMongo(savedRequest);
        createStatusHistory(savedRequest, status, updater);
        return savedRequest;
    }

    public ServiceRequest updatePriority(Long id, String priority) {
        ServiceRequest request = getRequestById(id);
        request.setPriority(priority);
        ServiceRequest savedRequest = serviceRequestRepository.save(request);
        saveRequestToMongo(savedRequest);
        return savedRequest;
    }

    public ServiceRequest updateRequest(Long id, ServiceRequestDTO dto, Authentication authentication) {
        ServiceRequest request = getRequestById(id);
        String previousStatus = request.getStatus();
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCategory(dto.getCategory());
        request.setPriority(dto.getPriority());
        request.setStatus(dto.getStatus());

        ServiceRequest savedRequest = serviceRequestRepository.save(request);
        saveRequestToMongo(savedRequest);

        if (!Objects.equals(previousStatus, dto.getStatus())) {
            User updater = null;
            if (authentication != null) {
                updater = userRepository.findByEmail(authentication.getName()).orElse(null);
            }
            createStatusHistory(savedRequest, dto.getStatus(), updater);
        }
        return savedRequest;
    }

    public String deleteRequest(Long id) {
        List<RequestStatus> statuses = requestStatusRepository.findByServiceRequest_Id(id);
        if (!statuses.isEmpty()) {
            requestStatusRepository.deleteAll(statuses);
            if (mongoRequestStatusService != null) {
                mongoRequestStatusService.deleteStatusByRequestId(id);
            }
        }

        serviceRequestRepository.deleteById(id);
        mongoServiceRequestRepository.deleteByRequestId(id);
        return "Request deleted successfully!";
    }

    private void createStatusHistory(ServiceRequest request, String status, User updatedBy) {
        RequestStatus requestStatus = new RequestStatus();
        requestStatus.setServiceRequest(request);
        requestStatus.setStatus(status);
        requestStatus.setUpdatedBy(updatedBy);

        RequestStatus savedStatus = requestStatusRepository.save(requestStatus);
        saveStatusToMongo(savedStatus);
    }

    private void saveStatusToMongo(RequestStatus status) {
        if (mongoRequestStatusService != null) {
            mongoRequestStatusService.syncStatus(status);
        }
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

