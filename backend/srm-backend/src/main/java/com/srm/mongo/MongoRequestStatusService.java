package com.srm.mongo;

import com.srm.model.RequestStatus;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MongoRequestStatusService {

    private static final Logger logger = LoggerFactory.getLogger(MongoRequestStatusService.class);

    @Autowired(required = false)
    private MongoRequestStatusRepository mongoRequestStatusRepository;

    @Async
    public void syncStatus(RequestStatus status) {
        if (mongoRequestStatusRepository == null) {
            logger.debug("MongoRequestStatusRepository not available; skipping sync for statusId={}", status.getId());
            return;
        }

        try {
            MongoRequestStatus mongoStatus = mongoRequestStatusRepository
                    .findByStatusId(status.getId())
                    .orElse(new MongoRequestStatus());
            mongoStatus.setStatusId(status.getId());
            mongoStatus.setRequestId(status.getServiceRequest().getId());
            mongoStatus.setStatus(status.getStatus());
            mongoStatus.setUpdatedByEmail(status.getUpdatedBy() != null ? status.getUpdatedBy().getEmail() : null);
            mongoStatus.setUpdatedAt(status.getUpdatedAt());
            mongoRequestStatusRepository.save(mongoStatus);
            logger.info("Synced request status to MongoDB: statusId={}, requestId={}", status.getId(), status.getServiceRequest().getId());
        } catch (Exception ex) {
            logger.error("MongoRequestStatusService.syncStatus failed for statusId={}: {}", status.getId(), ex.getMessage());
        }
    }

    public void syncStatuses(List<RequestStatus> statuses) {
        if (statuses == null || statuses.isEmpty()) {
            return;
        }

        for (RequestStatus status : statuses) {
            syncStatus(status);
        }
    }

    @Async
    public void deleteStatusByRequestId(Long requestId) {
        if (mongoRequestStatusRepository == null) {
            logger.debug("MongoRequestStatusRepository not available; skipping delete sync for requestId={}", requestId);
            return;
        }

        try {
            mongoRequestStatusRepository.deleteByRequestId(requestId);
            logger.info("Deleted request status history from MongoDB for requestId={}", requestId);
        } catch (Exception ex) {
            logger.error("MongoRequestStatusService.deleteStatusByRequestId failed for requestId={}: {}", requestId, ex.getMessage());
        }
    }
}
