import { useCallback, useEffect, useState } from "react";
import { getAllRequestsApi, getMyRequestsApi, searchRequestsApi } from "../lib";

import "../styles/Dashboard.css";

function filterRequests(requests, searchText) {
    const searchTerms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
    return requests.filter((request) => {
        const searchableText = [
            request.title,
            request.description,
            request.category,
            request.status,
            request.priority,
            request.user?.name,
            request.user?.email
        ].join(" ").toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
    });
}

function mergeRequests(primaryRequests, secondaryRequests) {
    const requestMap = new Map();
    [...primaryRequests, ...secondaryRequests].forEach((request) => {
        requestMap.set(request.id, request);
    });

    return Array.from(requestMap.values());
}

function normalizeRole(role) {
    const normalizedRole = String(role || "USER").toUpperCase();
    return normalizedRole === "PROVIDER" ? "MANAGER" : normalizedRole;
}

function SemanticSearch() {
    const [query, setQuery] = useState("");
    const [allRequests, setAllRequests] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadVisibleRequests = useCallback(async () => {
        const role = normalizeRole(localStorage.getItem("role"));
        const response = role === "ADMIN" || role === "MANAGER"
            ? await getAllRequestsApi()
            : await getMyRequestsApi();

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Unable to load requests");
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }, []);

    const refreshRequests = useCallback(async () => {
        setLoading(true);

        try {
            const visibleRequests = await loadVisibleRequests();
            setAllRequests(visibleRequests);
        } catch (error) {
            console.log(error);
            alert(error.message || "Unable to load requests");
        } finally {
            setLoading(false);
        }
    }, [loadVisibleRequests]);

    useEffect(() => {
        queueMicrotask(refreshRequests);
    }, [refreshRequests]);

    useEffect(() => {
        const searchText = query.trim();

        if (!searchText) {
            return undefined;
        }

        const searchTimer = window.setTimeout(() => {
            setResults(filterRequests(allRequests, searchText));
            setSearched(true);
        }, 120);

        return () => window.clearTimeout(searchTimer);
    }, [allRequests, query]);

    async function handleSearch() {
        const searchText = query.trim();

        if (!searchText) {
            setResults([]);
            setSearched(false);
            return;
        }

        setLoading(true);

        try {
            const apiResults = await searchFromApi(searchText);
            const localResults = filterRequests(allRequests, searchText);
            setResults(mergeRequests(apiResults, localResults));
            setSearched(true);
        } catch (error) {
            console.log(error);
            setResults(filterRequests(allRequests, searchText));
            setSearched(true);
        } finally {
            setLoading(false);
        }
    }

    function handleQueryChange(event) {
        const value = event.target.value;
        setQuery(value);

        if (!value.trim()) {
            setResults([]);
            setSelectedRequest(null);
            setSearched(false);
        }
    }

    async function searchFromApi(searchText) {
        const response = await searchRequestsApi(searchText);
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Search failed");
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }

    function statusClass(status) {
        const normalizedStatus = String(status || "").toLowerCase();
        if (normalizedStatus.includes("resolved") || normalizedStatus.includes("complete")) return "resolved";
        if (normalizedStatus.includes("pending") || normalizedStatus.includes("open")) return "pending";
        return "in-progress";
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Semantic Search</h1>
                    <p>Search service requests with natural language and see results instantly.</p>
                </div>
            </div>

            <div className="table-container">
                <div className="search-row">
                    <input
                        type="text"
                        placeholder="Search like: network outage, printer issue, hardware repair"
                        value={query}
                        onChange={handleQueryChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                    />
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? "Loading..." : "Search"}
                    </button>
                </div>

                {results.length === 0 ? (
                    <div className="empty-state">
                        {searched ? "No matching service requests found." : "Enter a search query to discover matching service requests."}
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((request) => (
                                <tr
                                    key={request.id}
                                    className="clickable-row"
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
                                    <td>#{request.id}</td>
                                    <td>{request.title}</td>
                                    <td>{request.category}</td>
                                    <td>
                                        <span className={`status ${statusClass(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>{request.priority}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedRequest && (
                <div className="detail-overlay" role="dialog" aria-modal="true" aria-labelledby="search-request-detail-title">
                    <div className="detail-panel">
                        <div className="detail-header">
                            <div>
                                <span className="hero-badge">Request #{selectedRequest.id}</span>
                                <h2 id="search-request-detail-title">{selectedRequest.title}</h2>
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

export default SemanticSearch;
