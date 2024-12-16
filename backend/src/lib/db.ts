import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing environment variables:");
  console.error(`SUPABASE_URL: ${process.env.SUPABASE_URL ? "✓" : "✗"}`);
  console.error(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"}`);
  throw new Error("Supabase credentials are required");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(process.env.DATABASE_URL, { prepare: false });
export const db = drizzle(client);

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test the Supabase connection
supabase.auth.getSession().catch((error) => {
  console.error("Failed to connect to Supabase:", error.message);
});
