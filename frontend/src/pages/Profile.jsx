import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordApi, getCurrentUserApi } from "../lib";
import "../styles/Profile.css";

function Profile() {
    const navigate = useNavigate();
    const sessionEmail = getTokenEmail() || localStorage.getItem("email") || "";
    const [user, setUser] = useState({
        name: localStorage.getItem("name") || "",
        email: sessionEmail,
        phone: localStorage.getItem("phone") || "",
        role: localStorage.getItem("role") || ""
    });
    const [profileStatus, setProfileStatus] = useState("Loading profile...");
    const [sessionExpired, setSessionExpired] = useState(false);
    const [showChangePwd, setShowChangePwd] = useState(false);
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [pwdMessage, setPwdMessage] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await getCurrentUserApi();
                const responseText = await response.text();
                let data = {};

                if (responseText) {
                    try {
                        data = JSON.parse(responseText);
                    } catch {
                        throw new Error(responseText);
                    }
                }

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        setSessionExpired(true);
                        throw new Error("Your session has expired. Please log in again to load profile details.");
                    }
                    throw new Error(data.message || data.error || "Unable to load profile");
                }

                setUser((existingUser) => {
                    const merged = { ...existingUser, ...data };
                    localStorage.setItem("name", merged.name || "");
                    localStorage.setItem("email", merged.email || "");
                    localStorage.setItem("phone", merged.phone || "");
                    localStorage.setItem("role", merged.role || "");
                    return merged;
                });
                setProfileStatus("");
            } catch (error) {
                setProfileStatus(error.message || "Unable to load profile");
            }
        }

        loadProfile();
    }, []);

    function loginAgain() {
        localStorage.clear();
        navigate("/login", { replace: true });
    }

    function openChangePwd(event) {
        event?.preventDefault();
        setShowChangePwd(true);
    }

    function closeChangePwd() {
        setShowChangePwd(false);
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        setPwdMessage("");
    }

    async function submitChangePwd(event) {
        event.preventDefault();
        if (!currentPwd || !newPwd || !confirmPwd) {
            setPwdMessage("Please fill all fields");
            return;
        }
        if (newPwd !== confirmPwd) {
            setPwdMessage("New passwords do not match");
            return;
        }

        setPwdMessage("Submitting...");

        try {
            const response = await changePasswordApi({
                currentPassword: currentPwd,
                newPassword: newPwd,
                email: user.email
            });
            const responseText = await response.text();
            let message = responseText;

            try {
                const parsedMessage = JSON.parse(responseText);
                message = parsedMessage.message || parsedMessage.error || responseText;
            } catch {
                message = responseText;
            }

            if (!response.ok) {
                throw new Error(message || "Unable to change password");
            }

            setPwdMessage(message || "Password changed successfully");
            setTimeout(closeChangePwd, 700);
        } catch (error) {
            setPwdMessage(error.message || "Unable to change password");
        }
    }

    if (showChangePwd) {
        return (
            <div className="change-password-page">
                <div className="change-password-card">
                    <div className="change-password-header">
                        <span>Account Security</span>
                        <h1>Change Password</h1>
                        <p>Choose a strong new password to keep your account secure.</p>
                    </div>

                    <form onSubmit={submitChangePwd} autoComplete="off">
                        <div className="info-box">
                            <label>Current Password</label>
                            <input type="password" name="currentPassword" autoComplete="current-password" value={currentPwd} onChange={(event) => setCurrentPwd(event.target.value)} />
                        </div>
                        <div className="info-box">
                            <label>New Password</label>
                            <input type="password" name="newPassword" autoComplete="new-password" value={newPwd} onChange={(event) => setNewPwd(event.target.value)} />
                        </div>
                        <div className="info-box">
                            <label>Confirm New Password</label>
                            <input type="password" name="confirmPassword" autoComplete="new-password" value={confirmPwd} onChange={(event) => setConfirmPwd(event.target.value)} />
                        </div>
                        {pwdMessage && <div className="pwd-message">{pwdMessage}</div>}
                        <div className="change-password-actions">
                            <button type="button" className="edit-btn" onClick={closeChangePwd}>Cancel</button>
                            <button type="submit" className="change-pwd-submit">Save Password</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-top">
                    <div className="profile-avatar">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</div>
                    <h1>{user.name || "User"}</h1>
                    <p>{user.role || "User"}</p>
                </div>

                <div className="profile-info-section">
                    {profileStatus && (
                        <div className="profile-status">
                            <span>{profileStatus}</span>
                            {sessionExpired && <button type="button" onClick={loginAgain}>Log In Again</button>}
                        </div>
                    )}

                    <div className="info-box">
                        <label>Full Name</label>
                        <input type="text" value={user.name || "Not provided"} readOnly />
                    </div>

                    <div className="info-box">
                        <label>Email Address</label>
                        <input type="email" value={user.email || "Not provided"} readOnly />
                    </div>

                    <div className="info-box">
                        <label>Phone Number</label>
                        <input type="tel" value={user.phone || "Not provided"} readOnly />
                    </div>

                    <div className="info-box">
                        <label>Role</label>
                        <input type="text" value={user.role || "Not provided"} readOnly />
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="change-pwd-btn" onClick={openChangePwd}>Change Password</button>
                </div>
            </div>
        </div>
    );
}

function getTokenEmail() {
    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
        const payload = token.split(".")[1];
        const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(normalizedPayload));
        return decodedPayload.sub || decodedPayload.email || "";
    } catch {
        return "";
    }
}

export default Profile;
