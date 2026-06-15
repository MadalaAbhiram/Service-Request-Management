import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllRequestsApi, getAllUsersApi } from "../../lib";
import "../../styles/Dashboard.css";
import {
    buildPriorityMix,
    buildRequestStats,
    normalizeRole
} from "../../utils/dashboardMetrics";

function AdminDashboard() {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const governance = [
        { title: "Admin", detail: "Full workspace control, user management, delete and edit rights." },
        { title: "Manager", detail: "Can assign, edit, delete and change request status across teams." },
        { title: "User", detail: "Can create requests, view own history and search permitted records." }
    ];

    const loadDashboardData = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);

        try {
            const [requestResponse, userResponse] = await Promise.all([
                getAllRequestsApi(),
                getAllUsersApi()
            ]);

            if (!requestResponse.ok) {
                const message = await requestResponse.text();
                throw new Error(message || "Unable to load requests");
            }

            if (!userResponse.ok) {
                const message = await userResponse.text();
                throw new Error(message || "Unable to load users");
            }

            const [requestData, userData] = await Promise.all([
                requestResponse.json(),
                userResponse.json()
            ]);

            setRequests(Array.isArray(requestData) ? requestData : []);
            setUsers(Array.isArray(userData) ? userData : []);
        } catch (error) {
            console.log(error);
            if (!silent) alert(error.message || "Unable to load dashboard data");
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(loadDashboardData);
    }, [loadDashboardData]);

    useEffect(() => {
        const refreshDashboard = () => loadDashboardData({ silent: true });
        const refreshTimer = window.setInterval(refreshDashboard, 8000);
        window.addEventListener("focus", refreshDashboard);

        return () => {
            window.clearInterval(refreshTimer);
            window.removeEventListener("focus", refreshDashboard);
        };
    }, [loadDashboardData]);

    const requestStats = useMemo(() => buildRequestStats(requests), [requests]);
    const priorityMix = useMemo(() => buildPriorityMix(requests), [requests]);
    const managersActive = useMemo(() => (
        users.filter((user) => normalizeRole(user.role) === "MANAGER").length
    ), [users]);
    const roleGroups = useMemo(() => (
        new Set(users.map((user) => normalizeRole(user.role))).size
    ), [users]);

    const metrics = [
        { label: "Total Users", value: users.length },
        { label: "Open Requests", value: requestStats.pending + requestStats.inProgress },
        { label: "Resolved Requests", value: requestStats.resolved },
        { label: "Managers Active", value: managersActive }
    ];

    const quickStats = [
        { label: "User groups", value: roleGroups },
        { label: "Workflow stages", value: 3 },
        { label: "New tickets", value: requestStats.pending }
    ];

    const maxPriorityCount = Math.max(...priorityMix.map((item) => item.value), 1);

    return (
        <div className="dashboard-page">
            <div className="dashboard-top">
                <div className="hero-card">
                    <span className="hero-badge">Command Center</span>
                    <h1>Welcome, Admin</h1>
                    <p>Monitor users, requests, role access and high-priority service activity from one secure management layer.</p>
                    <div className="hero-actions-inline">
                        <a className="action-button" href="/my-requests">Take Requests</a>
                        <a className="ghost-button" href="/accounts">Manage Accounts</a>
                        <button type="button" className="ghost-button" onClick={() => loadDashboardData()}>Refresh</button>
                    </div>
                </div>

                <div className="stats-panel">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="stats-card">
                            <p>{metric.label}</p>
                            <h2>{metric.value}</h2>
                        </div>
                    ))}
                </div>
            </div>

            <div className="role-access-grid">
                {governance.map((item) => (
                    <div className="access-card" key={item.title}>
                        <span>{item.title}</span>
                        <p>{item.detail}</p>
                    </div>
                ))}
            </div>

            <div className="bottom-grid">
                <div className="insight-card status-card">
                    <div className="card-title-row">
                        <span className="card-title">Task Status</span>
                        <span className="card-meta">{loading ? "Loading" : `${requestStats.total} total`}</span>
                    </div>
                    <div className="ring-wrap">
                        <div
                            className="progress-ring"
                            style={{ "--progress": `${requestStats.completionRate}%` }}
                            role="progressbar"
                            aria-label="Resolved request completion"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={requestStats.completionRate}
                        >
                            <span>{requestStats.completionRate}%</span>
                        </div>
                    </div>
                    <div className="status-summary">
                        <div>
                            <strong>In progress</strong>
                            <p>{requestStats.inProgress} requests</p>
                        </div>
                        <div>
                            <strong>Pending</strong>
                            <p>{requestStats.pending} requests</p>
                        </div>
                    </div>
                </div>

                <div className="insight-card priority-card">
                    <div className="card-title-row">
                        <span className="card-title">Priority Mix</span>
                        <span className="card-meta">Task urgency</span>
                    </div>
                    <div className="priority-list">
                        {priorityMix.map((item) => (
                            <div key={item.label} className="priority-row">
                                <span>{item.label}</span>
                                <div className="bar-shell">
                                    <div className="bar-fill" style={{ width: `${(item.value / maxPriorityCount) * 100}%`, background: item.color }} />
                                </div>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="insight-card quick-card">
                    <div className="card-title-row">
                        <span className="card-title">Quick Insights</span>
                        <span className="card-meta">Live ratios</span>
                    </div>
                    <div className="insight-list">
                        {quickStats.map((stat) => (
                            <div key={stat.label} className="insight-item">
                                <span>{stat.label}</span>
                                <strong>{stat.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="insight-card action-center">
                    <div className="card-title-row">
                        <span className="card-title">Admin Rights</span>
                        <span className="card-meta">Enabled</span>
                    </div>
                    <div className="admin-actions">
                        <a href="/my-requests">Edit Data</a>
                        <a href="/my-requests">Delete Record</a>
                        <a href="/my-requests">Change Status</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
