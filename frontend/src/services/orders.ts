import { Order, createOrderSchema, type Order as OrderType } from "../types";
import { useApi } from "./_api";

export function useOrdersService() {
  const api = useApi();

  const getOrders = async (storeId: string): Promise<OrderType[]> => {
    const data = await api.get<unknown[]>(`/orders/${storeId}`);
    try {
      return data.map((order) => Order.parse(order));
    } catch (error) {
      console.error("Order validation failed:", error);
      throw error;
    }
  };

  const createOrder = async (
    storeId: string,
    data: Omit<OrderType, "id" | "storeId" | "createdAt" | "updatedAt">
  ) => {
    const validatedData = createOrderSchema.parse(data);
    const responseData = await api.post<unknown>(`/orders/${storeId}`, validatedData);
    return Order.parse(responseData);
  };

  const updateOrderStatus = async (storeId: string, id: string, status: OrderType["status"]) => {
    const data = await api.patch<unknown>(`/orders/${storeId}/${id}`, { status });
    return Order.parse(data);
  };

  const deleteOrder = async (storeId: string, id: string) => {
    return api.delete(`/orders/${storeId}/${id}`);
  };

  return {
    getOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  };
}
