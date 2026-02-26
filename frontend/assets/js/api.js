/**
 * Generic helper for JSON-based API requests.
 */
async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = window.localStorage && window.localStorage.getItem("access_token");
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
    if (auth && (response.status === 401 || response.status === 403)) {
      try {
        window.localStorage && window.localStorage.removeItem("access_token");
      } catch (_) {}
      window.location.href = "login.html";
      throw new Error("Authentication required. Please log in again.");
    }

    let detail = "API request failed";
    try {
      const data = await response.json();
      if (data && (data.detail || data.message)) {
        detail = typeof data.detail === "string" ? data.detail : data.detail[0] || data.message;
      }
    } catch (_) {}
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
