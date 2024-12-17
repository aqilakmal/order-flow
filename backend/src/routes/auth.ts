import { Hono } from "hono";
import { z } from "zod";
import { supabase } from "../db/index.js";
import { authMiddleware } from "../middleware.js";

const auth = new Hono();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

auth.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = authSchema.parse(body);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      message: "Registration successful",
      user: data.user,
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Invalid registration data",
      },
      400
    );
  }
});

auth.post("/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = authSchema.parse(body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Invalid login credentials",
      },
      400
    );
  }
});

auth.get("/validate", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default auth;
