import { ApiResponse } from "../../shared/types";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const isFormData = init?.body instanceof FormData;
    const headers: HeadersInit = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(path, {
      ...init,
      headers: {
        ...headers,
        ...init?.headers,
      }
    });
    if (!res.ok) {
      let errorMessage = `Server error: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch (e) {
        // Could not parse error JSON, stick with statusText
      }
      throw new Error(errorMessage);
    }
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success || json.data === undefined) {
      throw new Error(json.error || 'Request failed with an unknown error.');
    }
    return json.data;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw server-originated or known errors
      throw error;
    }
    // Catch genuine network failures (e.g., server is down)
    throw new Error('Network error: Could not connect to the API.');
  }
}