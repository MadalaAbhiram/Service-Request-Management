import { useEffect, useMemo, useState } from "react";
import { deleteUserApi, getAllUsersApi } from "../lib";
import { getMongoUsersApi } from "../lib";

import "../styles/Dashboard.css";

function AccountsManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [source, setSource] = useState("postgres"); // 'postgres' or 'mongo'
    const currentEmail = localStorage.getItem("email");

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (roleFilter === "ALL") return users;
        return users.filter((user) => normalizeRole(user.role) === roleFilter);
    }, [roleFilter, users]);

    async function loadUsers() {
        setLoading(true);

        try {
            const response = await getAllUsersApi();
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to load accounts");
            }

    
    async function loadMongoUsers() {
        setLoading(true);
        try {
            const response = await getMongoUsersApi();
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to load mongo accounts");
            }

            const data = await response.json();
            // Normalize Mongo user shape to match Postgres shape where possible
            const normalized = Array.isArray(data)
                ? data.map((u, i) => ({ id: u._id || u.id || i + 1, name: u.name, email: u.email, role: u.role }))
                : [];
            setUsers(normalized);
            setSource("mongo");
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to load mongo accounts");
        } finally {
            setLoading(false);
        }
    }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to load accounts");
        } finally {
            setLoading(false);
        }
    }

    async function deleteAccount(user) {
        if (user.email === currentEmail) {
            alert("You cannot delete the account you are currently using.");
            return;
        }

        const confirmed = window.confirm(`Delete ${user.name || user.email}? This account will be removed from the database.`);
        if (!confirmed) return;

        try {
            const response = await deleteUserApi(user.id);
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to delete account");
            }

            setUsers((existingUsers) => existingUsers.filter((existingUser) => existingUser.id !== user.id));
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to delete account");
        }
    }

    function normalizeRole(role) {
        const normalizedRole = String(role || "USER").toUpperCase();
        return normalizedRole === "PROVIDER" ? "MANAGER" : normalizedRole;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Accounts Management</h1>
                    <p>Handle all saved accounts, review roles, and delete user or manager accounts from the database.</p>
                </div>
            </div>

            <div className="table-container">
                <div className="table-actions">
                    <div className="filter-tabs">
                        {["ALL", "ADMIN", "MANAGER", "USER"].map((role) => (
                            <button
                                key={role}
                                type="button"
                                className={roleFilter === role ? "active" : ""}
                                onClick={() => setRoleFilter(role)}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <div>
                        <button type="button" className="ghost-button" onClick={loadUsers}>Refresh</button>
                        <button type="button" className={source === "mongo" ? "ghost-button active" : "ghost-button"} onClick={loadMongoUsers} style={{ marginLeft: 8 }}>
                            Load Mongo Users
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state">Loading accounts...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">No accounts found for this role.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>{user.name || "Unnamed"}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className="readonly-pill">{normalizeRole(user.role)}</span>
                                    </td>
                                    <td>
                                        <div className="table-action-row">
                                            <button
                                                type="button"
                                                className="danger-action"
                                                onClick={() => deleteAccount(user)}
                                                disabled={source === "mongo"}
                                                title={source === "mongo" ? "Deleting Mongo users is disabled from this UI" : "Delete account"}
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AccountsManagement;
