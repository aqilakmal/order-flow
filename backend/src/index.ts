import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db/index.js";
import { ordersTable } from "./db/schema.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import storesRouter from "./routes/stores.js";

console.log("Configuration:", {
  frontendUrl: process.env.FRONTEND_URL,
  nodeEnv: process.env.NODE_ENV,
  inviteCodeStart: process.env.INVITE_CODE_START,
});

const app = new Hono();

/**
 * Configure CORS
 * Make sure cors() middleware is the first middleware in the chain
 */
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["*"],
    credentials: true,
    maxAge: 3600,
  })
);

// Mount routes
app.route("/auth", authRoutes);
app.route("/stores", storesRouter);
app.route("/orders", orderRoutes);

/**
 * @description Root endpoint to check if the server is running
 * @route GET /
 * @returns {string} 200 - Hello World message
 */
app.get("/", (c) => {
  return c.text("Hello World");
});

/**
 * @description Health check endpoint to verify database connection
 * @route GET /health
 * @returns {Object} 200 - Health status with message
 * @returns {Object} 500 - Error message if database connection fails
 */
app.get("/health", async (c) => {
  try {
    await db.select().from(ordersTable).limit(1);
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

export default app;
