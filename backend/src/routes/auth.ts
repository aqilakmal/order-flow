import "dotenv/config";
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

/**
 * @description Register a new user with email, password and invite code
 * @route POST /auth/signup
 * @param {Object} body.required - Request body
 * @param {string} body.email - User's email
 * @param {string} body.password - User's password (min 6 characters)
 * @param {string} body.inviteCode - Invite code for registration
 * @returns {Object} 200 - User object and success message
 * @returns {Object} 400 - Error message
 */
auth.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, inviteCode } = signupSchema.parse(body);

    const expectedInviteCode = process.env.INVITE_CODE_START + email.slice(0, 3).toUpperCase();

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

/**
 * @description Authenticate user with email and password
 * @route POST /auth/signin
 * @param {Object} body.required - Request body
 * @param {string} body.email - User's email
 * @param {string} body.password - User's password
 * @returns {Object} 200 - Session and user object
 * @returns {Object} 400 - Error message
 */
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

/**
 * @description Validate user's authentication status
 * @route GET /auth/validate
 * @security Bearer
 * @returns {Object} 200 - User object
 * @returns {Object} 401 - Unauthorized error
 */
auth.get("/validate", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

/**
 * @description Change user's password
 * @route POST /auth/change-password
 * @security Bearer
 * @param {Object} body.required - Request body
 * @param {string} body.currentPassword - Current password
 * @param {string} body.newPassword - New password (min 6 characters)
 * @returns {Object} 200 - Success message
 * @returns {Object} 400 - Error message
 * @returns {Object} 401 - Unauthorized error
 */
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
