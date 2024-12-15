import { Hono } from "hono";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "../lib/db.js";
import { orders } from "../lib/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/middleware.js";

const ordersRouter = new Hono();

const OrderStatus = {
  PREPARING: "preparing",
  COMPLETED: "completed",
} as const;

const orderSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  name: z.string(),
  status: z.enum([OrderStatus.PREPARING, OrderStatus.COMPLETED]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Get all orders - public endpoint
ordersRouter.get("/", async (c) => {
  try {
    const data = await db.select().from(orders).orderBy(orders.updatedAt);
    return c.json(
      data.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// Apply auth middleware to all other order routes
ordersRouter.use("/*", authMiddleware);

ordersRouter.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const validatedData = createOrderSchema.parse(body);
    const now = new Date();
    const newOrder = {
      ...validatedData,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };

    const [data] = await db.insert(orders).values(newOrder).returning();

    return c.json({
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    return c.json({ error: "Invalid order data" }, 400);
  }
});

ordersRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    const [data] = await db
      .update(orders)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    if (!data) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    return c.json({ error: "Invalid status" }, 400);
  }
});

ordersRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const [deletedOrder] = await db.delete(orders).where(eq(orders.id, id)).returning();

    if (!deletedOrder) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete order" }, 500);
  }
});

// Add OPTIONS handler for orders routes
ordersRouter.options('/*', (c) => {
  return c.text('', 204);
});

export default ordersRouter; 