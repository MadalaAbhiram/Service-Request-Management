import { useCallback, useEffect, useState } from "react";
import {
    deleteRequestApi,
    getAllRequestsApi,
    getMyRequestsApi,
    updatePriorityApi,
    updateStatusApi
} from "../lib";

import "../styles/Dashboard.css";

const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

function MyRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const role = normalizeRole(localStorage.getItem("role"));
    const canManage = role === "ADMIN" || role === "MANAGER";

    const loadRequests = useCallback(async () => {
        setLoading(true);

        try {
            const response = canManage ? await getAllRequestsApi() : await getMyRequestsApi();
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to load requests");
            }

            const data = await response.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to load requests");
        } finally {
            setLoading(false);
        }
    }, [canManage]);

    useEffect(() => {
        queueMicrotask(loadRequests);
    }, [loadRequests]);

    async function changeStatus(id, status) {
        try {
            const response = await updateStatusApi(id, status);
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to update status");
            }

            const updatedRequest = await parseRequestResponse(response, id, { status });
            setRequests((existingRequests) => existingRequests.map((request) => (
                request.id === id ? updatedRequest : request
            )));
            setSelectedRequest((request) => request?.id === id ? updatedRequest : request);
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to update status");
        }
    }

    async function changePriority(id, priority) {
        try {
            const response = await updatePriorityApi(id, priority);
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to update priority");
            }

            const updatedRequest = await parseRequestResponse(response, id, { priority });
            setRequests((existingRequests) => existingRequests.map((request) => (
                request.id === id ? updatedRequest : request
            )));
            setSelectedRequest((request) => request?.id === id ? updatedRequest : request);
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to update priority");
        }
    }

    async function parseRequestResponse(response, id, fallbackChanges) {
        const responseText = await response.text();
        if (responseText) {
            return JSON.parse(responseText);
        }

        const existingRequest = requests.find((request) => request.id === id);
        return {
            ...existingRequest,
            ...fallbackChanges
        };
    }

    async function removeRequest(id) {
        const confirmed = window.confirm("Delete this request from the database?");
        if (!confirmed) return;

        try {
            const response = await deleteRequestApi(id);
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to delete request");
            }

            setRequests((existingRequests) => existingRequests.filter((request) => request.id !== id));
            setSelectedRequest((request) => request?.id === id ? null : request);
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to delete request");
        }
    }

    function statusClass(status) {
        const normalizedStatus = String(status || "").toLowerCase();
        if (normalizedStatus.includes("complete") || normalizedStatus.includes("resolved")) return "resolved";
        if (normalizedStatus.includes("pending") || normalizedStatus.includes("open")) return "pending";
        return "in-progress";
    }

    function isCompleted(status) {
        const normalizedStatus = String(status || "").toLowerCase();
        return normalizedStatus.includes("complete") || normalizedStatus.includes("resolved");
    }

    function normalizeRole(value) {
        const normalizedRole = String(value || "USER").toUpperCase();
        return normalizedRole === "PROVIDER" ? "MANAGER" : normalizedRole;
    }

    const visibleRequests = priorityFilter === "ALL"
        ? requests
        : requests.filter((request) => String(request.priority || "").toUpperCase() === priorityFilter);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>{canManage ? "Manage Requests" : "My Requests"}</h1>
                    <p>{canManage ? "Take requests by priority, update progress, complete work, or delete incorrect records." : "Review the live database status of every request you submitted."}</p>
                </div>
            </div>

            {canManage && (
                <div className="table-container">
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {["ALL", "LOW", "MEDIUM", "HIGH"].map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    className={priorityFilter === priority ? "active" : ""}
                                    onClick={() => setPriorityFilter(priority)}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                        <button type="button" className="ghost-button" onClick={loadRequests}>Refresh</button>
                    </div>
                </div>
            )}

            <div className="request-list">
                {loading && <div className="empty-state">Loading your requests...</div>}

                {!loading && visibleRequests.length === 0 && (
                    <div className="empty-state">No requests found.</div>
                )}

                {!loading && visibleRequests.map((request) => (
                    <div
                        key={request.id}
                        className="request-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedRequest(request)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedRequest(request);
                            }
                        }}
                    >
                        <div className="request-card-top">
                            <div>
                                <h3>{request.title}</h3>
                                <p>{request.category} {request.user?.email ? `- ${request.user.email}` : ""}</p>
                            </div>
                            <span className={`status ${statusClass(request.status)}`}>
                                {request.status}
                            </span>
                        </div>
                        <div className="meta">
                            <span className="meta-pill">ID: #{request.id}</span>
                            <span className="meta-pill">Priority: {request.priority}</span>
                            <span className="meta-pill">Created: {request.createdAt ? new Date(request.createdAt).toLocaleString() : "Recently"}</span>
                        </div>
                        {canManage && (
                            <div className="request-actions" onClick={(event) => event.stopPropagation()}>
                                {isCompleted(request.status) ? (
                                    <button type="button" className="completed-action" disabled>
                                        Completed
                                    </button>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => changeStatus(request.id, "in-progress")}>
                                            Take / In Progress
                                        </button>
                                        <button type="button" onClick={() => changeStatus(request.id, "completed")}>
                                            Complete
                                        </button>
                                        <div className="priority-picker compact" role="group" aria-label={`Priority for request ${request.id}`}>
                                            {priorityOptions.map((priority) => (
                                                <button
                                                    key={priority}
                                                    type="button"
                                                    className={String(request.priority || "LOW").toUpperCase() === priority ? "active" : ""}
                                                    onClick={() => changePriority(request.id, priority)}
                                                >
                                                    {priority}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <button type="button" className="danger-action" onClick={() => removeRequest(request.id)}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedRequest && (
                <div className="detail-overlay" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
                    <div className="detail-panel">
                        <div className="detail-header">
                            <div>
                                <span className="hero-badge">Request #{selectedRequest.id}</span>
                                <h2 id="request-detail-title">{selectedRequest.title}</h2>
                            </div>
                            <button type="button" className="detail-close" onClick={() => setSelectedRequest(null)}>
                                Close
                            </button>
                        </div>

                        <div className="detail-description">
                            <span>Description</span>
                            <p>{selectedRequest.description || "No description added."}</p>
                        </div>

                        <div className="detail-grid">
                            <div>
                                <span>Status</span>
                                <strong className={`status ${statusClass(selectedRequest.status)}`}>
                                    {selectedRequest.status || "Pending"}
                                </strong>
                            </div>
                            <div>
                                <span>Priority</span>
                                <strong>{selectedRequest.priority || "LOW"}</strong>
                            </div>
                            <div>
                                <span>Category</span>
                                <strong>{selectedRequest.category || "Not set"}</strong>
                            </div>
                            <div>
                                <span>Created</span>
                                <strong>{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "Recently"}</strong>
                            </div>
                            <div>
                                <span>User</span>
                                <strong>{selectedRequest.user?.email || selectedRequest.user?.name || "Current account"}</strong>
                            </div>
                            <div>
                                <span>Request ID</span>
                                <strong>#{selectedRequest.id}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyRequest;
