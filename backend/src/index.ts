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

// Configure CORS with wildcard first to debug
app.use('*', async (c, next) => {
  // Add CORS headers manually
  c.res.headers.set('Access-Control-Allow-Origin', 'https://sewurasa.utf.sh');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: c.res.headers
    });
  }

  await next();
});

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
