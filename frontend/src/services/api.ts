import { Order, createOrderSchema, type Order as OrderType } from "../types/order";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getOrders(): Promise<OrderType[]> {
  const response = await fetch(`${API_URL}/orders`);
  const data = await response.json();
  return data.map((order: unknown) => Order.parse(order));
}

export async function createOrder(data: OrderType) {
  const validatedData = createOrderSchema.parse(data);
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validatedData),
  });
  const responseData = await response.json();
  return Order.parse(responseData);
}

export async function updateOrderStatus(id: string, status: OrderType["status"]) {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  return Order.parse(data);
}
