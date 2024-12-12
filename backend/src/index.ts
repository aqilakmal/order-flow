import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { nanoid } from "nanoid";
import { supabase } from "./lib/db";

const app = new Hono();
app.use(cors());

const OrderStatus = {
  PREPARING: "preparing",
  COMPLETED: "completed",
} as const;

const orderSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string(),
  status: z.enum([OrderStatus.PREPARING, OrderStatus.COMPLETED]),
  createdAt: z.string(),
});

const createOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
});

// Routes
app.get("/orders", async (c) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const transformedData = data.map((order) => ({
    ...order,
    createdAt: order.created_at,
  }));

  return c.json(transformedData);
});

app.post("/orders", async (c) => {
  const body = await c.req.json();

  try {
    const validatedData = createOrderSchema.parse(body);
    const newOrder = {
      ...validatedData,
      id: nanoid(),
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          ...newOrder,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    const transformedData = {
      ...data,
      createdAt: data.created_at,
    };

    return c.json(transformedData);
  } catch (error) {
    return c.json({ error: "Invalid order data" }, 400);
  }
});

app.patch("/orders/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: body.status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    if (!data) {
      return c.json({ error: "Order not found" }, 404);
    }

    const transformedData = {
      ...data,
      createdAt: data.created_at,
    };

    return c.json(transformedData);
  } catch (error) {
    return c.json({ error: "Invalid status" }, 400);
  }
});

export default app;
