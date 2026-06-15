export const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://service-request-management-1-lhyv.onrender.com"; // default to gateway


// Common Headers

export function getHeaders() {

    const token =
        localStorage.getItem("token");

    return {

        "Content-Type":
            "application/json",

        Authorization:
            `Bearer ${token}`
    };
}


// =========================
// AUTH APIs
// =========================

export async function loginApi(data) {

    return fetch(
        `${BASE_URL}/api/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(data)
        }
    );
}


export async function registerApi(data) {

    return fetch(
        `${BASE_URL}/api/auth/register`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(data)
        }
    );
}



// =========================
// REQUEST APIs
// =========================

export async function createRequestApi(data) {

    return fetch(
        `${BASE_URL}/api/requests`,
        {
            method: "POST",

            headers: getHeaders(),

            body: JSON.stringify(data)
        }
    );
}


export async function getMyRequestsApi() {

    return fetch(
        `${BASE_URL}/api/requests/my`,
        {
            headers: getHeaders()
        }
    );
}


export async function getAllRequestsApi() {

    return fetch(
        `${BASE_URL}/api/requests`,
        {
            headers: getHeaders()
        }
    );
}


export async function searchRequestsApi(query) {

    return fetch(
        `${BASE_URL}/api/requests/search?query=${encodeURIComponent(query)}`,
        {
            headers: getHeaders()
        }
    );
}


export async function updateStatusApi(id, status) {

    return fetch(
        `${BASE_URL}/api/requests/${id}/status?status=${encodeURIComponent(status)}`,
        {
            method: "PATCH",

            headers: getHeaders()
        }
    );
}


export async function deleteRequestApi(id) {

    return fetch(
        `${BASE_URL}/api/requests/${id}`,
        {
            method: "DELETE",

            headers: getHeaders()
        }
    );
}



// =========================
// USER APIs
// =========================

export async function getAllUsersApi() {

    return fetch(
        `${BASE_URL}/api/users`,
        {
            headers: getHeaders()
        }
    );
}

export async function getMongoUsersApi() {
    // This routes to the Node backend via the gateway when using the path /api/mongo/*
    return fetch(
        `${BASE_URL}/api/mongo/users`,
        {
            headers: getHeaders()
        }
    );
}

export async function getCurrentUserApi() {

    return fetch(
        `${BASE_URL}/api/users/me`,
        {
            headers: getHeaders()
        }
    );
}


export async function deleteUserApi(id) {

    return fetch(
        `${BASE_URL}/api/users/${id}`,
        {
            method: "DELETE",

            headers: getHeaders()
        }
    );
}

export async function changePasswordApi(data) {

    return fetch(
        `${BASE_URL}/api/users/change-password`,
        {
            method: "POST",

            headers: getHeaders(),

            body: JSON.stringify(data)
        }
    );
}

export async function updatePriorityApi(id, priority) {

    return fetch(
        `${BASE_URL}/api/requests/${id}/priority?priority=${encodeURIComponent(priority)}`,
        {
            method: "PATCH",

            headers: getHeaders()
        }
    );
}
