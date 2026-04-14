import { Router } from "express";
import { z } from "zod";
import { authRateLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/auth";
import { findUserByUsername } from "../models/userModel";
import { verifyPassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import {
  storeRefreshToken,
  findAndDeleteRefreshToken,
  deleteAllRefreshTokensForUser,
} from "../utils/refreshToken";
import { findUserById } from "../models/userModel";

const router = Router();

const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_EXPIRES_DAYS = 7;

function refreshCookieOptions() {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_EXPIRES_DAYS);
  return {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict" as const,
    expires,
    path: "/",
  };
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1).trim(),
  password: z.string().min(1),
});

router.post("/login", authRateLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { username, password } = parsed.data;

  const userRow = await findUserByUsername(username);
  if (!userRow) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, userRow.password_hash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload = { userId: userRow.id, username: userRow.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);
  await storeRefreshToken(userRow.id, refreshToken, expiresAt);

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions());
  res.json({
    accessToken,
    user: { id: userRow.id, username: userRow.username },
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

  if (token) {
    await findAndDeleteRefreshToken(token);
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
  res.json({ message: "Logged out" });
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post("/refresh", authRateLimiter, async (req, res) => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

  if (!token) {
    res.status(401).json({ error: "No refresh token" });
    return;
  }

  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  const record = await findAndDeleteRefreshToken(token);
  if (!record) {
    res.status(401).json({ error: "Refresh token not found or expired" });
    return;
  }

  const newPayload = { userId: payload.userId, username: payload.username };
  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);
  await storeRefreshToken(record.user_id, newRefreshToken, expiresAt);

  res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, refreshCookieOptions());
  res.json({ accessToken: newAccessToken });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, username: user.username });
});

// ── POST /api/auth/register (dev-only seed route) ─────────────────────────────
// This is only accessible in non-production environments for seeding the first user.
import { hashPassword } from "../utils/password";
import { createUser } from "../models/userModel";

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  if (process.env["NODE_ENV"] === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const { username, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  try {
    const user = await createUser(username, passwordHash);
    res.status(201).json({ id: user.id, username: user.username });
  } catch {
    res.status(409).json({ error: "Username already exists" });
  }
});

export default router;
