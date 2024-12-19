import { Order, createOrderSchema, type Order as OrderType } from "../types";
import { useApi } from "../lib/api";

/**
 * @description Hook to access order-related functionality
 * @returns {Object} Object containing order methods (getOrders, createOrder, updateOrderStatus, deleteOrder)
 */
export function useOrdersService() {
  const api = useApi();

  /**
   * @description Get all orders for a specific store
   * @param {string} storeId - Store ID to get orders for
   * @returns {Promise<OrderType[]>} List of orders
   * @throws {Error} If fetching orders fails or validation fails
   */
  const getOrders = async (storeId: string): Promise<OrderType[]> => {
    const data = await api.get<unknown[]>(`/orders/${storeId}`);
    try {
      return data.map((order) => Order.parse(order));
    } catch (error) {
      console.error("Order validation failed:", error);
      throw error;
    }
  };

  /**
   * @description Create a new order for a store
   * @param {string} storeId - Store ID to create order for
   * @param {Omit<OrderType, "id" | "storeId" | "createdAt" | "updatedAt">} data - Order data
   * @returns {Promise<OrderType>} Created order
   * @throws {Error} If order creation or validation fails
   */
  const createOrder = async (
    storeId: string,
    data: Omit<OrderType, "id" | "storeId" | "createdAt" | "updatedAt">
  ) => {
    const validatedData = createOrderSchema.parse(data);
    const responseData = await api.post<unknown>(`/orders/${storeId}`, validatedData);
    return Order.parse(responseData);
  };

  /**
   * @description Update the status of an order
   * @param {string} storeId - Store ID the order belongs to
   * @param {string} id - Order ID to update
   * @param {OrderType["status"]} status - New order status
   * @returns {Promise<OrderType>} Updated order
   * @throws {Error} If status update or validation fails
   */
  const updateOrderStatus = async (storeId: string, id: string, status: OrderType["status"]) => {
    const data = await api.patch<unknown>(`/orders/${storeId}/${id}`, { status });
    return Order.parse(data);
  };

  /**
   * @description Delete an order
   * @param {string} storeId - Store ID the order belongs to
   * @param {string} id - Order ID to delete
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {Error} If deletion fails
   */
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
