import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "./lib/db.js";
import { orders } from "./lib/schema.js";
import { eq } from "drizzle-orm";

const app = new Hono();
app.use(cors());

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
});

const createOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
});

// Hello World
app.get("/", (c) => {
  return c.text("Hello World");
});

// Health check
app.get("/health", async (c) => {
  try {
    await db.select().from(orders).limit(1);
    return c.json({
      status: "healthy",
      message: "Database connection is working",
    });
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Routes
app.get("/orders", async (c) => {
  try {
    const data = await db.select().from(orders).orderBy(orders.createdAt);
    return c.json(
      data.map((order) => ({
        ...order,
        createdAt: order.createdAt,
      }))
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

/**
 * Create an order
 *
 * @route POST /orders
 * @description Creates a new order in the system
 *
 * @requestBody {object} order
 * @property {string} number - The order number
 * @property {string} name - Customer name
 * @property {string} status - Order status (PREPARING or COMPLETED)
 *
 * @returns {object} Created order
 * @property {string} id - Unique order ID
 * @property {string} number - Order number
 * @property {string} name - Customer name
 * @property {string} status - Order status
 * @property {string} createdAt - Creation timestamp
 *
 * @throws {400} Invalid order data
 */
app.post("/orders", async (c) => {
  const body = await c.req.json();

  try {
    const validatedData = createOrderSchema.parse(body);
    const newOrder = {
      ...validatedData,
      id: nanoid(),
      createdAt: new Date(),
    };

    const [data] = await db.insert(orders).values(newOrder).returning();

    return c.json({
      ...data,
      createdAt: data.createdAt,
    });
  } catch (error) {
    return c.json({ error: "Invalid order data" }, 400);
  }
});

app.patch("/orders/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    const [data] = await db
      .update(orders)
      .set({ status: body.status })
      .where(eq(orders.id, id))
      .returning();

    if (!data) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({
      ...data,
      createdAt: data.createdAt,
    });
  } catch (error) {
    return c.json({ error: "Invalid status" }, 400);
  }
});

app.delete("/orders/:id", async (c) => {
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

export default app;
