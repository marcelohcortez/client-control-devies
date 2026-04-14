import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@client-control/shared";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is required`);
  return value;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, requireEnv("JWT_SECRET"), {
    expiresIn: (process.env["JWT_EXPIRES_IN"] ?? "15m") as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, requireEnv("JWT_REFRESH_SECRET"), {
    expiresIn: (process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d") as jwt.SignOptions["expiresIn"],
    // jwtid makes every token unique even when generated at the same second
    jwtid: crypto.randomUUID(),
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, requireEnv("JWT_SECRET"));
  return decoded as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, requireEnv("JWT_REFRESH_SECRET"));
  return decoded as JwtPayload;
}
