import { Hono } from "hono";
import { z } from "zod";
import { supabase } from "../db/index.js";
import { authMiddleware } from "../middleware.js";

const auth = new Hono();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  inviteCode: z.string(),
});

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

auth.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, inviteCode } = signupSchema.parse(body);

    const expectedInviteCode = "INV" + email.slice(0, 3).toUpperCase();

    if (inviteCode !== expectedInviteCode) {
      return c.json({ error: "Invalid invite code" }, 400);
    }

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

auth.post("/change-password", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = passwordChangeSchema.parse(body);
    const user = c.get("user");

    // First verify the current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }

    // Update the password
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: "Password updated successfully" });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to update password",
      },
      400
    );
  }
});

export default auth;
