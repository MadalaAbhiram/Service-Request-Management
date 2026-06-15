package com.srm.mongo;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "connection_events")
public class MongoConnectionEvent {

    @Id
    private String id;

    private String application;
    private String status;
    private Instant connectedAt;

    public MongoConnectionEvent() {
    }

    public MongoConnectionEvent(String application, String status, Instant connectedAt) {
        this.application = application;
        this.status = status;
        this.connectedAt = connectedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getApplication() {
        return application;
    }

    public void setApplication(String application) {
        this.application = application;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(Instant connectedAt) {
        this.connectedAt = connectedAt;
    }
}
