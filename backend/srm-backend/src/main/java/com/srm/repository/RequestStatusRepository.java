package com.srm.repository;

import com.srm.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestStatusRepository extends JpaRepository<RequestStatus, Long> {
    List<RequestStatus> findByServiceRequest_Id(Long requestId);
    void deleteByServiceRequest_Id(Long requestId);
}
