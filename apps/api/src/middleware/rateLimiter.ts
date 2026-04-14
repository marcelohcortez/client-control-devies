import { rateLimit } from "express-rate-limit";

const isDev = process.env["NODE_ENV"] !== "production";

// Auth endpoints: tight limit — 10 req / 15 min in production
const authMax = process.env["AUTH_RATE_LIMIT"]
  ? parseInt(process.env["AUTH_RATE_LIMIT"], 10)
  : isDev ? 1000 : 10;

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// All API routes: broader cap to prevent bulk data extraction / DoS
const apiMax = process.env["API_RATE_LIMIT"]
  ? parseInt(process.env["API_RATE_LIMIT"], 10)
  : isDev ? 10000 : 200;

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
