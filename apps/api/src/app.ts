import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/auth";
import clientRoutes from "./routes/clients";
import { apiRateLimiter } from "./middleware/rateLimiter";

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — whitelist only ─────────────────────────────────────────────────────
const corsOrigin = process.env["CORS_ORIGIN"];
if (!corsOrigin) throw new Error("CORS_ORIGIN environment variable is required");

app.use(
  cors({
    origin: corsOrigin,
    credentials: true, // needed for httpOnly cookie on refresh token
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", apiRateLimiter);
app.get("/api/health", (_req, res) => { res.json({ ok: true }); });
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
