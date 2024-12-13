import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  order_id: varchar('order_id', { length: 256 }).notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['preparing', 'completed'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}); 