
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

import Landing from "./components/Landing";
import Home from "./components/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import ProviderDashboard from "./pages/provider/ProviderDashboard";

import CreateRequest from "./pages/CreateRequest";
import MyRequest from "./pages/MyRequest";
import SemanticSearch from "./pages/SemanticSearch";
import AccountsManagement from "./pages/AccountsManagement";

import "./index.css";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const role = normalizeRole(localStorage.getItem("role"));

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={role === "ADMIN" ? "/admin" : role === "MANAGER" ? "/manager" : "/user"} />;
    }

    return children;
}

function normalizeRole(role) {
    const normalizedRole = String(role || "USER").toUpperCase();
    return normalizedRole === "PROVIDER" ? "MANAGER" : normalizedRole;
}

function AppRoutes() {
    const navigate = useNavigate();

    return (
        <Routes>

            {/* Landing */}

            <Route
                path="/"
                element={<Landing onLogin={() => navigate("/login")} />}
            />


            {/* Auth */}

            <Route
                path="/login"
                element={<Login onBack={() => navigate("/")} />}
            />

            <Route
                path="/register"
                element={<Register onBack={() => navigate("/")} />}
            />

            {/* Admin */}

            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>

                        <Home>
                            <AdminDashboard />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* User */}

            <Route
                path="/manager"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>

                        <Home>
                            <ProviderDashboard />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* Provider */}

            <Route
                path="/provider"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER", "PROVIDER"]}>

                        <Home>
                            <ProviderDashboard />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* Profile */}

            <Route
                path="/user"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>

                        <Home>
                            <UserDashboard />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* Create Request */}

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>

                        <Home>
                            <Profile />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* My Requests */}

            <Route
                path="/create-request"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>

                        <Home>
                            <CreateRequest />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* Semantic Search */}

            <Route
                path="/my-requests"
                element={
                    <ProtectedRoute>

                        <Home>
                            <MyRequest />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* Accounts Management */}

            <Route
                path="/accounts"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>

                        <Home>
                            <AccountsManagement />
                        </Home>

                    </ProtectedRoute>
                }
            />


            {/* Semantic Search */}

            <Route
                path="/semantic-search"
                element={
                    <ProtectedRoute>

                        <Home>
                            <SemanticSearch />
                        </Home>

                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
