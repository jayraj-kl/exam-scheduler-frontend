// Base URL for all API calls
const API_BASE_URL = "http://localhost:8081/api";

// Default request options
const defaultOptions = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Include credentials to send cookies in cross-origin requests if needed
  credentials: "include" as RequestCredentials,
};

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  data?: any
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: defaultOptions.headers,
    credentials: defaultOptions.credentials,
    ...(data && { body: JSON.stringify(data) }),
  };

  try {
    const response = await fetch(url, options);

    // For file downloads (like Excel exports)
    if (endpoint.includes("/export")) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "schedule.xlsx"; // Default filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      return {} as T;
    }

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Regular JSON response
    const responseData = await response.json();
    return responseData as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
