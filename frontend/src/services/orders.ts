import { Order, createOrderSchema, type Order as OrderType } from "../types";

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

export async function getOrders(storeId: string): Promise<OrderType[]> {
  const response = await fetch(`${API_URL}/orders/${storeId}`, {
    headers: getAuthHeader(),
  });
  const data = await response.json();
  try {
    return data.map((order: unknown) => Order.parse(order));
  } catch (error) {
    console.error("Order validation failed:", error);
    throw error;
  }
}

export async function createOrder(
  storeId: string,
  data: Omit<OrderType, "id" | "storeId" | "createdAt" | "updatedAt">
) {
  const validatedData = createOrderSchema.parse(data);
  const response = await fetch(`${API_URL}/orders/${storeId}`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(validatedData),
    mode: "cors",
    credentials: "include",
  });
  const responseData = await response.json();
  return Order.parse(responseData);
}

export async function updateOrderStatus(storeId: string, id: string, status: OrderType["status"]) {
  const response = await fetch(`${API_URL}/orders/${storeId}/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify({ status }),
    mode: "cors",
    credentials: "include",
  });
  const data = await response.json();
  return Order.parse(data);
}

export async function deleteOrder(storeId: string, id: string) {
  const response = await fetch(`${API_URL}/orders/${storeId}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
    mode: "cors",
    credentials: "include",
  });
  return response.ok;
}