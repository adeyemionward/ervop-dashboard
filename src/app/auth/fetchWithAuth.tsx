const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

interface RefreshResponse {
  status: boolean;
  token?: string;
  message?: string;
}

// Make API requests with automatic refresh for active users
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/auth/login";
    return Promise.reject(new Error("No token found"));
  }

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, options);

  // If JWT expired during active session, try refresh
  if (response.status === 401) {
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const refreshResult: RefreshResponse = await refreshResponse.json();

    if (refreshResult.status && refreshResult.token) {
      token = refreshResult.token;
      localStorage.setItem("token", token);

      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };

      response = await fetch(url, options);
    } else {
      // Refresh failed → force logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
      return Promise.reject(
        new Error(refreshResult.message || "Session expired")
      );
    }
  }

  return response;
};
