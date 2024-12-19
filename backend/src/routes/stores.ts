import { Hono } from "hono";
import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import {
  storesTable,
  createStoreSchema,
  updateStoreSchema,
  generateStoreId,
  type CreateStore,
  type UpdateStore,
} from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware.js";

const storesRouter = new Hono();

// Apply auth middleware to all store routes
storesRouter.use("/*", authMiddleware);

/**
 * @description Get all stores for the authenticated user
 * @route GET /stores
 * @security Bearer
 * @returns {Array} 200 - List of stores
 * @returns {Object} 500 - Error message
 */
storesRouter.get("/", async (c) => {
  try {
    const user = c.get("user");
    const stores = await db.select().from(storesTable).where(eq(storesTable.ownerId, user.id));
    return c.json(stores);
  } catch (error) {
    console.error("[stores/GET]: ", error);
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

/**
 * @description Create a new store
 * @route POST /stores
 * @security Bearer
 * @param {Object} body.required - Request body
 * @param {string} body.name - Store name
 * @param {string} [body.storeId] - Custom store ID (generated if not provided)
 * @param {string} [body.description] - Store description
 * @returns {Object} 200 - Created store object
 * @returns {Object} 400 - Error message
 */
storesRouter.post("/", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const validatedData = createStoreSchema.parse(body) as CreateStore;

    const storeId = validatedData.storeId || generateStoreId();

    // Check if store ID is already taken
    const existingStore = await db
      .select()
      .from(storesTable)
      .where(eq(storesTable.storeId, storeId))
      .limit(1);

    if (existingStore.length > 0) {
      return c.json({ error: "Store ID already taken" }, 400);
    }

    const now = new Date();
    const newStore = {
      ...validatedData,
      id: nanoid(),
      storeId,
      ownerId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const [store] = await db.insert(storesTable).values(newStore).returning();

    return c.json(store);
  } catch (error) {
    console.error("[stores/POST]: ", error);
    return c.json({ error: "Invalid store data" }, 400);
  }
});

/**
 * @description Update store details
 * @route PATCH /stores/:id
 * @security Bearer
 * @param {string} id.path.required - Store ID
 * @param {Object} body.required - Request body
 * @param {string} [body.name] - Store name
 * @param {string} [body.storeId] - Store ID
 * @param {string} [body.description] - Store description
 * @returns {Object} 200 - Updated store object
 * @returns {Object} 400 - Error message
 * @returns {Object} 403 - Unauthorized error
 * @returns {Object} 404 - Store not found error
 */
storesRouter.patch("/:id", async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = await c.req.json();

    // Check store ownership
    const store = await db.select().from(storesTable).where(eq(storesTable.id, id)).limit(1);

    if (!store.length) {
      return c.json({ error: "Store not found" }, 404);
    }

    if (store[0].ownerId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const validatedData = updateStoreSchema.parse(body) as UpdateStore;

    if (validatedData.storeId) {
      // Check if new store ID is already taken
      const existingStore = await db
        .select()
        .from(storesTable)
        .where(eq(storesTable.storeId, validatedData.storeId))
        .limit(1);

      if (existingStore.length > 0 && existingStore[0].id !== id) {
        return c.json({ error: "Store ID already taken" }, 400);
      }
    }

    const [updatedStore] = await db
      .update(storesTable)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(storesTable.id, id))
      .returning();

    return c.json(updatedStore);
  } catch (error) {
    console.error("[stores/PATCH]: ", error);
    return c.json({ error: "Invalid store data" }, 400);
  }
});

/**
 * @description Delete a store
 * @route DELETE /stores/:id
 * @security Bearer
 * @param {string} id.path.required - Store ID
 * @returns {Object} 200 - Success message
 * @returns {Object} 403 - Unauthorized error
 * @returns {Object} 404 - Store not found error
 * @returns {Object} 500 - Error message
 */
storesRouter.delete("/:id", async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");

    // Check store ownership
    const store = await db.select().from(storesTable).where(eq(storesTable.id, id)).limit(1);

    if (!store.length) {
      return c.json({ error: "Store not found" }, 404);
    }

    if (store[0].ownerId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.delete(storesTable).where(eq(storesTable.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error("[stores/DELETE]: ", error);
    return c.json({ error: "Failed to delete store" }, 500);
  }
});

export default storesRouter;
