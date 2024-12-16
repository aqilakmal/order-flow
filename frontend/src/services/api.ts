import { Order, createOrderSchema, type Order as OrderType } from "../types/order";

const API_URL = import.meta.env.VITE_API_URL;

// Debug log
console.log("API_URL:", API_URL);

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

export async function getOrders(): Promise<OrderType[]> {
  const response = await fetch(`${API_URL}/orders`, {
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

export async function createOrder(data: Omit<OrderType, "id" | "createdAt" | "updatedAt">) {
  const validatedData = createOrderSchema.parse(data);
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(validatedData),
    mode: "cors",
    credentials: "include",
  });
  const responseData = await response.json();
  return Order.parse(responseData);
}

export async function updateOrderStatus(id: string, status: OrderType["status"]) {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify({ status }),
    mode: "cors",
    credentials: "include",
  });
  const data = await response.json();
  return Order.parse(data);
}

export async function deleteOrder(id: string) {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
    mode: "cors",
    credentials: "include",
  });
  return response.ok;
}
