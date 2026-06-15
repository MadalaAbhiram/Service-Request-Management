import { useState } from "react";
import { BASE_URL } from "../lib";

import "../styles/Dashboard.css";

const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

function CreateRequest() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        priority: "LOW"
    });

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const response = await fetch(
                `${BASE_URL}/api/requests`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                alert("Request Created");
                setFormData({
                    title: "",
                    description: "",
                    category: "",
                    priority: "LOW"
                });
            } else {
                alert("Failed to Create Request");
            }
        } catch (error) {
            console.log(error);
            alert("Server Error");
        }
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Create Service Request</h1>
                    <p>Submit a new support request so our team can take action quickly.</p>
                </div>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <label>Request Title</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Enter request title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />

                    <label>Request Description</label>
                    <textarea
                        name="description"
                        placeholder="Describe the service need in detail"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={6}
                    />

                    <label>Category</label>
                    <input
                        type="text"
                        name="category"
                        placeholder="Example: IT Support, Maintenance, Facilities"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />

                    <label>Priority</label>
                    <div className="priority-picker" role="group" aria-label="Priority">
                        {priorityOptions.map((priority) => (
                            <button
                                key={priority}
                                type="button"
                                className={formData.priority === priority ? "active" : ""}
                                onClick={() => setFormData({ ...formData, priority })}
                            >
                                {priority}
                            </button>
                        ))}
                    </div>

                    <button type="submit" className="action-button">
                        Submit Request
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateRequest;
