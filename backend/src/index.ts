import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./lib/db.js";
import { orders } from "./lib/schema.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

console.log('CORS configuration:', {
  frontendUrl: process.env.FRONTEND_URL,
  nodeEnv: process.env.NODE_ENV
});

const app = new Hono();

// Add OPTIONS handler for pre-flight requests
app.options('*', (c) => {
  return c.text('', 204);
});

// Configure CORS - more permissive configuration
app.use(cors({
  origin: '*',  // More permissive for testing
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['*'],  // Allow all headers
  exposeHeaders: ['*'],
  credentials: true,
  maxAge: 3600,
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
