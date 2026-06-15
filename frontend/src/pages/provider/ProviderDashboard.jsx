import { useCallback, useEffect, useMemo, useState } from "react";
import "../../styles/Dashboard.css";
import ProgressBar from "../../components/ProgressBar";
import { getAllRequestsApi } from "../../lib";
import { buildRequestStats, normalizeStatus } from "../../utils/dashboardMetrics";

function ProviderDashboard() {
    const role = localStorage.getItem("role") || "MANAGER";
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);

        try {
            const response = await getAllRequestsApi();
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

    const requestStats = useMemo(() => buildRequestStats(requests), [requests]);
    const visibleRequests = useMemo(() => requests.slice(0, 5), [requests]);
    const stats = [
        { label: "Assigned", value: requestStats.total },
        { label: "Pending", value: requestStats.pending },
        { label: "Completed", value: requestStats.resolved },
        { label: "In Progress", value: requestStats.inProgress }
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-top">
                <div className="hero-card">
                    <span className="hero-badge">Manager Desk</span>
                    <h1>Manage requests</h1>
                    <p>Review assignments, update status, edit request data, and keep service delivery moving.</p>
                    <div className="hero-actions-inline">
                        <a className="action-button" href="/my-requests">Take Requests</a>
                        <button type="button" className="ghost-button" onClick={() => loadRequests()}>Refresh</button>
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
                    <h2>Assigned Requests</h2>
                </div>
                {loading ? (
                    <div className="empty-state">Loading assigned requests...</div>
                ) : visibleRequests.length === 0 ? (
                    <div className="empty-state">No requests found.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Issue</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Workflow</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRequests.map((request) => (
                                <tr key={request.id}>
                                    <td>#{request.id}</td>
                                    <td>{request.title}</td>
                                    <td>{request.category}</td>
                                    <td>
                                        <span className={`status ${normalizeStatus(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>
                                        <ProgressBar status={request.status} />
                                    </td>
                                    <td>
                                        <div className="table-action-row">
                                            <a className="ghost-button" href="/my-requests">Manage</a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="role-access-grid">
                <div className="access-card">
                    <span>{role} Rights</span>
                    <p>Managers can edit request details, delete incorrect records and change request status.</p>
                </div>
                <div className="access-card">
                    <span>Service Advantage</span>
                    <p>Focused work queue, priority visibility and direct action controls reduce handoff delays.</p>
                </div>
            </div>
        </div>
    );
}

export default ProviderDashboard;
