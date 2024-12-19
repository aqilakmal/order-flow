import { useAuthHeader } from "./utils";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL environment variable is not set");
}

/**
 * @description Hook to access API methods with authentication headers
 * @returns {Object} Object containing HTTP methods (get, post, patch, delete)
 */
export function useApi() {
  const headers = useAuthHeader();

  /**
   * @description Perform a GET request to the API
   * @template T - Type of the response data
   * @param {string} endpoint - API endpoint to call
   * @returns {Promise<T>} Response data
   * @throws {Error} If the request fails
   */
  const get = async <T>(endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data as T;
  };

  /**
   * @description Perform a POST request to the API
   * @template T - Type of the response data
   * @param {string} endpoint - API endpoint to call
   * @param {unknown} body - Request body
   * @returns {Promise<T>} Response data
   * @throws {Error} If the request fails
   */
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

  /**
   * @description Perform a PATCH request to the API
   * @template T - Type of the response data
   * @param {string} endpoint - API endpoint to call
   * @param {unknown} body - Request body
   * @returns {Promise<T>} Response data
   * @throws {Error} If the request fails
   */
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

  /**
   * @description Perform a DELETE request to the API
   * @param {string} endpoint - API endpoint to call
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {Error} If the request fails
   */
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
