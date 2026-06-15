export function normalizeStatus(status) {
    const normalizedStatus = String(status || "").toLowerCase();
    if (normalizedStatus.includes("complete") || normalizedStatus.includes("resolved")) return "resolved";
    if (normalizedStatus.includes("pending") || normalizedStatus.includes("open")) return "pending";
    return "in-progress";
}

export function normalizeRole(role) {
    const normalizedRole = String(role || "USER").toUpperCase();
    return normalizedRole === "PROVIDER" ? "MANAGER" : normalizedRole;
}

export function normalizePriority(priority) {
    const normalizedPriority = String(priority || "LOW").toUpperCase();
    return ["LOW", "MEDIUM", "HIGH"].includes(normalizedPriority) ? normalizedPriority : "LOW";
}

export function buildRequestStats(requests) {
    const total = requests.length;
    const pending = requests.filter((request) => normalizeStatus(request.status) === "pending").length;
    const resolved = requests.filter((request) => normalizeStatus(request.status) === "resolved").length;
    const inProgress = requests.filter((request) => normalizeStatus(request.status) === "in-progress").length;

    return {
        total,
        pending,
        resolved,
        inProgress,
        completionRate: total ? Math.round((resolved / total) * 100) : 0
    };
}

export function buildPriorityMix(requests) {
    const counts = requests.reduce((priorityCounts, request) => {
        const priority = normalizePriority(request.priority);
        return {
            ...priorityCounts,
            [priority]: priorityCounts[priority] + 1
        };
    }, { HIGH: 0, MEDIUM: 0, LOW: 0 });

    return [
        { label: "High", value: counts.HIGH, color: "#fb7185" },
        { label: "Medium", value: counts.MEDIUM, color: "#f97316" },
        { label: "Low", value: counts.LOW, color: "#22c55e" }
    ];
}
