import { Hono } from "hono";
import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import {
  ordersTable,
  storesTable,
  createOrderSchema,
  updateOrderSchema,
  type CreateOrder,
  type UpdateOrder,
} from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware.js";
import type { StatusCode } from "hono/utils/http-status";

const ordersRouter = new Hono();

/**
 * @description Get all orders for a store (public endpoint)
 * @route GET /orders/:storeId
 * @param {string} storeId.path.required - Store ID
 * @returns {Array} 200 - List of orders with timestamps in ISO format
 * @returns {Object} 404 - Store not found error
 * @returns {Object} 500 - Error message
 */
ordersRouter.get("/:storeId", async (c) => {
  try {
    const storeId = c.req.param("storeId");

    // First get the store
    const store = await db
      .select()
      .from(storesTable)
      .where(eq(storesTable.storeId, storeId))
      .limit(1);

    if (!store.length) {
      return c.json({ error: "Store not found" }, 404);
    }

    const data = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.storeId, store[0].id))
      .orderBy(ordersTable.updatedAt);

    return c.json(
      data.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[orders/GET]: ", error);
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// Apply auth middleware to all other order routes
ordersRouter.use("/*", authMiddleware);

/**
 * @description Helper function to check store ownership
 * @param {string} storeId - Store ID to check
 * @param {string} userId - User ID to verify ownership
 * @returns {Promise<{error: string, status: number} | {store: Object}>} Store ownership result
 * @private
 */
async function checkStoreOwnership(storeId: string, userId: string) {
  const store = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.storeId, storeId))
    .limit(1);

  if (!store.length) {
    return { error: "Store not found", status: 404 };
  }

  if (store[0].ownerId !== userId) {
    return { error: "Unauthorized", status: 403 };
  }

  return { store: store[0] };
}

/**
 * @description Create a new order for a store
 * @route POST /orders/:storeId
 * @security Bearer
 * @param {string} storeId.path.required - Store ID
 * @param {Object} body.required - Request body
 * @param {string} body.customerName - Customer name
 * @param {string} body.orderDetails - Order details
 * @param {string} [body.customerPhone] - Customer phone number
 * @returns {Object} 200 - Created order with timestamps in ISO format
 * @returns {Object} 400 - Invalid order data error
 * @returns {Object} 403 - Unauthorized error
 * @returns {Object} 404 - Store not found error
 */
ordersRouter.post("/:storeId", async (c) => {
  try {
    const user = c.get("user");
    const storeId = c.req.param("storeId");

    const ownership = await checkStoreOwnership(storeId, user.id);
    if ("error" in ownership) {
      return c.json({ error: ownership.error }, ownership.status as StatusCode);
    }

    const body = await c.req.json();
    const validatedData = createOrderSchema.parse(body) as CreateOrder;

    const now = new Date();
    const newOrder = {
      ...validatedData,
      id: nanoid(),
      storeId: ownership.store.id,
      createdAt: now,
      updatedAt: now,
    };

    const [data] = await db.insert(ordersTable).values(newOrder).returning();

    return c.json({
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[orders/POST]: ", error);
    return c.json({ error: "Invalid order data" }, 400);
  }
});

/**
 * @description Update order status
 * @route PATCH /orders/:storeId/:id
 * @security Bearer
 * @param {string} storeId.path.required - Store ID
 * @param {string} id.path.required - Order ID
 * @param {Object} body.required - Request body
 * @param {string} body.status - New order status
 * @returns {Object} 200 - Updated order with timestamps in ISO format
 * @returns {Object} 400 - Invalid status error
 * @returns {Object} 403 - Unauthorized error
 * @returns {Object} 404 - Order not found error
 */
ordersRouter.patch("/:storeId/:id", async (c) => {
  try {
    const user = c.get("user");
    const storeId = c.req.param("storeId");
    const id = c.req.param("id");

    const ownership = await checkStoreOwnership(storeId, user.id);
    if ("error" in ownership) {
      return c.json({ error: ownership.error }, ownership.status as StatusCode);
    }

    const body = await c.req.json();
    const validatedData = updateOrderSchema.parse(body) as UpdateOrder;

    const [data] = await db
      .update(ordersTable)
      .set({
        status: validatedData.status,
        updatedAt: new Date(),
      })
      .where(and(eq(ordersTable.id, id), eq(ordersTable.storeId, ownership.store.id)))
      .returning();

    if (!data) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[orders/PATCH]: ", error);
    return c.json({ error: "Invalid status" }, 400);
  }
});

/**
 * @description Delete an order
 * @route DELETE /orders/:storeId/:id
 * @security Bearer
 * @param {string} storeId.path.required - Store ID
 * @param {string} id.path.required - Order ID
 * @returns {Object} 200 - Success message
 * @returns {Object} 403 - Unauthorized error
 * @returns {Object} 404 - Order not found error
 * @returns {Object} 500 - Error message
 */
ordersRouter.delete("/:storeId/:id", async (c) => {
  try {
    const user = c.get("user");
    const storeId = c.req.param("storeId");
    const id = c.req.param("id");

    const ownership = await checkStoreOwnership(storeId, user.id);
    if ("error" in ownership) {
      return c.json({ error: ownership.error }, ownership.status as StatusCode);
    }

    const [deletedOrder] = await db
      .delete(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.storeId, ownership.store.id)))
      .returning();

    if (!deletedOrder) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("[orders/DELETE]: ", error);
    return c.json({ error: "Failed to delete order" }, 500);
  }
});

export default ordersRouter;
