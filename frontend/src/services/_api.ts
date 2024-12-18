import { useAuthHeader } from "../lib/utils";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL environment variable is not set");
}

export function useApi() {
  const headers = useAuthHeader();

  const get = async <T>(endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data as T;
  };

  const post = async <T>(endpoint: string, body: unknown) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      mode: "cors",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data as T;
  };

  const patch = async <T>(endpoint: string, body: unknown) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
      mode: "cors",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data as T;
  };

  const del = async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }
    return response.ok;
  };

  return {
    get,
    post,
    patch,
    delete: del,
  };
}
