import { Store, createStoreSchema, type Store as StoreType, type CreateStore } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL environment variable is not set");
}

function getAuthHeader(): HeadersInit {
  const session = localStorage.getItem("session");
  if (!session) return {};

  const { access_token } = JSON.parse(session);
  return {
    Authorization: `Bearer ${access_token}`,
    "Content-Type": "application/json",
  };
}

export async function getStores(): Promise<StoreType[]> {
  const response = await fetch(`${API_URL}/stores`, {
    headers: getAuthHeader(),
  });
  const data = await response.json();
  try {
    return data.map((store: unknown) => Store.parse(store));
  } catch (error) {
    console.error("Store validation failed:", error);
    throw error;
  }
}

export async function createStore(data: CreateStore) {
  const validatedData = createStoreSchema.parse(data);
  const response = await fetch(`${API_URL}/stores`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(validatedData),
    mode: "cors",
    credentials: "include",
  });
  const responseData = await response.json();
  return Store.parse(responseData);
}

export async function updateStore(id: string, data: Partial<CreateStore>) {
  const response = await fetch(`${API_URL}/stores/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
    mode: "cors",
    credentials: "include",
  });
  const responseData = await response.json();
  return Store.parse(responseData);
}

export async function deleteStore(id: string) {
  const response = await fetch(`${API_URL}/stores/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
    mode: "cors",
    credentials: "include",
  });
  return response.ok;
}
