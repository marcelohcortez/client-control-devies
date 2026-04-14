import { rateLimit } from "express-rate-limit";

const isDev = process.env["NODE_ENV"] !== "production";
const envMax = process.env["AUTH_RATE_LIMIT"];
const max = envMax ? parseInt(envMax, 10) : isDev ? 1000 : 10;

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
