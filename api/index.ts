// Vercel serverless entry point.
// @vercel/node accepts an Express app as a default export — it is a valid
// (req, res) handler. All routes and middleware defined in app.ts are preserved.
import app from "../apps/api/src/app";

export default app;
