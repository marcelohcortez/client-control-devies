import { createHash } from "crypto";
import { db } from "../db/client";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function storeRefreshToken(
  userId: number,
  token: string,
  expiresAt: Date
): Promise<void> {
  const tokenHash = hashToken(token);
  await db.execute({
    sql: "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    args: [userId, tokenHash, expiresAt.toISOString()],
  });
}

export async function findAndDeleteRefreshToken(
  token: string
): Promise<{ user_id: number } | null> {
  const tokenHash = hashToken(token);

  const result = await db.execute({
    sql: "SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = ?",
    args: [tokenHash],
  });

  const row = result.rows[0];
  if (!row) return null;

  // Check expiry
  const expiresAt = new Date(row["expires_at"] as string);
  if (expiresAt < new Date()) {
    // Clean up expired token
    await db.execute({
      sql: "DELETE FROM refresh_tokens WHERE token_hash = ?",
      args: [tokenHash],
    });
    return null;
  }

  // Delete (rotate)
  await db.execute({
    sql: "DELETE FROM refresh_tokens WHERE token_hash = ?",
    args: [tokenHash],
  });

  return { user_id: row["user_id"] as number };
}

export async function deleteAllRefreshTokensForUser(
  userId: number
): Promise<void> {
  await db.execute({
    sql: "DELETE FROM refresh_tokens WHERE user_id = ?",
    args: [userId],
  });
}
