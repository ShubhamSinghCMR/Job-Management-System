// Generic helper for JSON-based API requests.

async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
    const headers = {
        "Content-Type": "application/json",
    };

    if (auth) {
        const token = window.localStorage?.getItem("access_token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        // If auth is required and we got unauthorized/forbidden, force re-login.
        if (auth && (response.status === 401 || response.status === 403)) {
            try {
                window.localStorage?.removeItem("access_token");
            } catch {
                // ignore
            }
            window.location.href = "login.html";
            throw new Error("Authentication required. Please log in again.");
        }

        // Try to surface backend error message if present
        let detail = "API request failed";
        try {
            const data = await response.json();
            if (data && (data.detail || data.message)) {
                detail = data.detail || data.message;
            }
        } catch {
            // ignore JSON parse errors
        }
        throw new Error(detail);
    }

    // Some endpoints may return 204 (no content)
    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

