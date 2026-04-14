import { db } from "../db/client";
import type { User } from "@client-control/shared";

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export async function findUserByUsername(
  username: string
): Promise<UserRow | null> {
  const result = await db.execute({
    sql: "SELECT id, username, password_hash, created_at FROM users WHERE username = ?",
    args: [username],
  });

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row["id"] as number,
    username: row["username"] as string,
    password_hash: row["password_hash"] as string,
    created_at: row["created_at"] as string,
  };
}

export async function createUser(
  username: string,
  passwordHash: string
): Promise<User> {
  const result = await db.execute({
    sql: "INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username, created_at",
    args: [username, passwordHash],
  });

  const row = result.rows[0];
  if (!row) throw new Error("Failed to create user");

  return {
    id: row["id"] as number,
    username: row["username"] as string,
    created_at: row["created_at"] as string,
  };
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await db.execute({
    sql: "SELECT id, username, created_at FROM users WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row["id"] as number,
    username: row["username"] as string,
    created_at: row["created_at"] as string,
  };
}
