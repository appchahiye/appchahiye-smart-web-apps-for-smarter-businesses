import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
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
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}