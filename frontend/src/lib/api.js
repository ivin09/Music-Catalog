const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (body && body.messages && body.messages.join(", ")) ||
      (body && body.error) ||
      `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}

export const api = {
  register: (username, password) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  search: (query, type = "song", limit = 25) =>
    request(
      `/api/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(
        type
      )}&limit=${limit}`
    ),

  getLibrary: () => request("/api/library"),

  addToLibrary: (item) =>
    request("/api/library", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  updateLibraryItem: (id, updates) =>
    request(`/api/library/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteLibraryItem: (id) =>
    request(`/api/library/${id}`, {
      method: "DELETE",
    }),

  getAnalytics: () => request("/api/analytics"),

  getAiInsights: () => request("/api/ai/insights"),
};

export { getToken };
