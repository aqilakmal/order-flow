import { z } from "zod";

export const OrderStatus = {
  PREPARING: "preparing",
  COMPLETED: "completed",
} as const;

// Store Schema
export const storeSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Store = z.infer<typeof storeSchema>;

export const createStoreSchema = storeSchema
  .omit({
    id: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    storeId: z
      .string()
      .min(4)
      .max(50)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
  });

export type CreateStore = z.infer<typeof createStoreSchema>;

// Order Schema
export const orderSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  orderId: z.string(),
  name: z.string(),
  status: z.enum([OrderStatus.PREPARING, OrderStatus.COMPLETED]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

export const createOrderSchema = orderSchema.omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
});

// Export schemas for validation
export { orderSchema as Order, storeSchema as Store };
