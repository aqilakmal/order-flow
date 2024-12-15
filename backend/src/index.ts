import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./lib/db.js";
import { orders } from "./lib/schema.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

const app = new Hono();

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Mount routes
app.route("/auth", authRoutes);
app.route("/orders", orderRoutes);

// Public routes
app.get("/", (c) => {
  return c.text("Hello World");
});

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

export default app;
