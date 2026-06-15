import { useCallback, useEffect, useMemo, useState } from "react";
import ProgressBar from "../../components/ProgressBar";
import { getMyRequestsApi } from "../../lib";
import "../../styles/Dashboard.css";
import { buildRequestStats, normalizeStatus } from "../../utils/dashboardMetrics";

function UserDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const loadRequests = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);

        try {
            const response = await getMyRequestsApi();
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to load requests");
            }

            const data = await response.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
            if (!silent) alert(error.message || "Unable to load requests");
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(loadRequests);
    }, [loadRequests]);

    useEffect(() => {
        const refreshRequests = () => loadRequests({ silent: true });
        const refreshTimer = window.setInterval(refreshRequests, 8000);
        window.addEventListener("focus", refreshRequests);

        return () => {
            window.clearInterval(refreshTimer);
            window.removeEventListener("focus", refreshRequests);
        };
    }, [loadRequests]);

    const stats = useMemo(() => {
        const requestStats = buildRequestStats(requests);

        return [
            { label: "My Requests", value: requestStats.total },
            { label: "Pending", value: requestStats.pending },
            { label: "Resolved", value: requestStats.resolved },
            { label: "In Progress", value: requestStats.inProgress }
        ];
    }, [requests]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-top">
                <div className="hero-card">
                    <span className="hero-badge">Limited Access</span>
                    <h1>Welcome back</h1>
                    <p>Create service requests, track your own progress, and see status changes when an admin or manager takes your request.</p>
                    <div className="hero-actions-inline">
                        <a className="action-button" href="/create-request">Create Request</a>
                        <a className="ghost-button" href="/my-requests">View My Requests</a>
                    </div>
                </div>
                <div className="stats-panel">
                    {stats.map((metric) => (
                        <div key={metric.label} className="stats-card">
                            <h2>{metric.value}</h2>
                            <p>{metric.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <div className="table-header-row">
                    <h2>Request Tracking</h2>
                </div>

                {loading ? (
                    <div className="empty-state">Loading request tracking...</div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">No requests found for your account.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Access</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => (
                                <tr key={request.id}>
                                    <td>#{request.id}</td>
                                    <td>{request.title}</td>
                                    <td>
                                        <span className={`status ${normalizeStatus(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>
                                        <ProgressBar status={request.status} />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="readonly-pill"
                                            onClick={() => setSelectedRequest(request)}
                                        >
                                            View only
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedRequest && (
                <div className="detail-overlay" role="dialog" aria-modal="true" aria-labelledby="user-request-detail-title">
                    <div className="detail-panel">
                        <div className="detail-header">
                            <div>
                                <span className="hero-badge">Request #{selectedRequest.id}</span>
                                <h2 id="user-request-detail-title">{selectedRequest.title}</h2>
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
                                <strong className={`status ${normalizeStatus(selectedRequest.status)}`}>
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
                                <span>Request ID</span>
                                <strong>#{selectedRequest.id}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="role-access-grid">
                <div className="access-card">
                    <span>User Advantage</span>
                    <p>Simple request submission, transparent tracking, and faster updates from managers.</p>
                </div>
                <div className="access-card">
                    <span>Permission Boundary</span>
                    <p>Users cannot edit, delete, assign, or change system-wide service data.</p>
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
