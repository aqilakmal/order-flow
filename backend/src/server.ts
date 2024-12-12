import { serve } from '@hono/node-server'
import app from "./index";

const port = process.env.PORT || 3000;

serve({
  fetch: app.fetch,
  port: Number(port),
}, (info: any) => {
  console.log(`Server is running on port ${info.port}`);
});