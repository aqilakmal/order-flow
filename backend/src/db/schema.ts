import { pgTable, text, timestamp, varchar, unique } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Order status enum
export const OrderStatus = {
  PREPARING: "preparing",
  COMPLETED: "completed",
} as const;

// Store table definition
export const storesTable = pgTable("stores", {
  id: text("id").primaryKey(), // nanoid
  storeId: varchar("store_id", { length: 50 }).notNull().unique(), // customizable unique id
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(), // supabase user id
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order table definition with store relation
export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => storesTable.id), // foreign key to stores
  orderId: varchar("order_id", { length: 256 }).notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["preparing", "completed"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define relations
export const storesRelations = relations(storesTable, ({ many }) => ({
  orders: many(ordersTable),
}));

export const ordersRelations = relations(ordersTable, ({ one }) => ({
  store: one(storesTable, {
    fields: [ordersTable.storeId],
    references: [storesTable.id],
  }),
}));

// Generate Zod schemas for stores
export const storeSelectSchema = createSelectSchema(storesTable);
export const storeInsertSchema = createInsertSchema(storesTable);

export const createStoreSchema = storeInsertSchema
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
      .regex(/^[a-z0-9-]+$/, {
        message: "Store ID can only contain lowercase letters, numbers, and hyphens",
      })
      .optional(),
  });

export const updateStoreSchema = createStoreSchema.partial();

// Generate Zod schemas for orders
export const orderSelectSchema = createSelectSchema(ordersTable);
export const orderInsertSchema = createInsertSchema(ordersTable, {
  id: z.string(),
  status: z.enum([OrderStatus.PREPARING, OrderStatus.COMPLETED]),
});

export const createOrderSchema = orderInsertSchema.omit({
  id: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrderSchema = orderInsertSchema.pick({
  status: true,
});

// Export types
export type Store = z.infer<typeof storeSelectSchema>;
export type CreateStore = z.infer<typeof createStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;
export type Order = z.infer<typeof orderSelectSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;

// Helper function to generate random store ID
export function generateStoreId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
