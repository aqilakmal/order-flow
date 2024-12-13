import { z } from "zod";

export const OrderStatus = {
  PREPARING: "preparing",
  COMPLETED: "completed",
} as const;

export const orderSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  name: z.string(),
  status: z.enum([OrderStatus.PREPARING, OrderStatus.COMPLETED]),
  createdAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

export const createOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
});

// Export the schema for validation
export { orderSchema as Order };
