import type { Context, Next } from "hono";
import { supabase } from "./db.js";
import type { User } from "@supabase/supabase-js";

// Add type declaration for the Hono context
declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  // Allow OPTIONS requests to pass through for CORS preflight
  if (c.req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  
  try {
    // Verify the JWT token using Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Add user to context for later use
    c.set("user", user);
    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized" }, 401);
  }
}