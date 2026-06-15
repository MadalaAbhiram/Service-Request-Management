package com.srm.repository;

import com.srm.model.ServiceRequest;
import com.srm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByUser(User user);
    List<ServiceRequest> findByTitleContainingIgnoreCase(String title);
    List<ServiceRequest> findByUserAndTitleContainingIgnoreCase(User user, String title);
    List<ServiceRequest> findByStatus(String status);
    List<ServiceRequest> findByPriority(String priority);
}
