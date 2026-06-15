import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const role = normalizeRole(localStorage.getItem("role"));
    const name = localStorage.getItem("name") || "Team member";
    const isElevated = role === "ADMIN" || role === "MANAGER";

    const dashboardPath =
        role === "ADMIN"
            ? "/admin"
            : role === "MANAGER"
                ? "/manager"
                : "/user";

    const menuItems = [
        { label: "Dashboard", path: dashboardPath },
        ...(role === "USER"
            ? [
                { label: "Create Request", path: "/create-request" },
                { label: "My Requests", path: "/my-requests" }
            ]
            : role === "ADMIN"
                ? [
                    { label: "Manage Requests", path: "/my-requests" },
                    { label: "Accounts Management", path: "/accounts" }
                ]
                : [
                    { label: "Manage Requests", path: "/my-requests" }
                ]),
        { label: "Semantic Search", path: "/semantic-search" },
        { label: "Profile", path: "/profile" }
    ];

    const logout = () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
    };

    const handleLogoutAnimationEnd = () => {
        localStorage.clear();
        sessionStorage.setItem("logoutMessage", "true");
        navigate("/", { replace: true });
    };

    function normalizeRole(value) {
        const normalizedRole = String(value || "USER").toUpperCase();
        return normalizedRole === "PROVIDER" ? "MANAGER" : normalizedRole;
    }

    return (
        <>
            <div className={`logout-door ${isLoggingOut ? "closing" : ""}`} onAnimationEnd={handleLogoutAnimationEnd}>
                <div className="door-panel left" />
                <div className="door-panel right" />
            </div>

            <div className="sidebar-container">
                <div>
                    <div className="sidebar-logo">
                    <div className="logo-mark">S</div>
                    <div className="logo-copy">
                        <h1>SRM<span>Flow</span></h1>
                        <p>{isElevated ? "Control workspace" : "Request workspace"}</p>
                    </div>
                </div>

                <div className="sidebar-profile">
                    <span>{name.slice(0, 1).toUpperCase()}</span>
                    <div>
                        <strong>{name}</strong>
                        <p>{role === "ADMIN" ? "Admin access" : role === "MANAGER" ? "Manager access" : "User access"}</p>
                    </div>
                </div>

                <div className="access-panel">
                    <span>{isElevated ? "Full Access" : "Limited Access"}</span>
                    <p>{isElevated ? "Edit, delete, assign and update service data." : "Create requests and track your own progress."}</p>
                </div>

                <div className="sidebar-menu">
                    {menuItems.map((item) => (
                        <NavLink key={item.path + item.label} to={item.path} className={({ isActive }) => (isActive ? "active" : "")}>
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
        </>
    );
}

export default Sidebar;

