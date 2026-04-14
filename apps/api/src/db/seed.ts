// Seed script — creates the first admin user in the database.
// Usage: tsx --env-file=../../.env.local src/db/seed.ts
// Only run in development. Never run in production.

import { createUser } from "../models/userModel";
import { hashPassword } from "../utils/password";
import { findUserByUsername } from "../models/userModel";

async function seed() {
  const username = process.env["SEED_USERNAME"] ?? "admin";
  const password = process.env["SEED_PASSWORD"] ?? "adminadmin";

  const existing = await findUserByUsername(username);
  if (existing) {
    console.log(`User '${username}' already exists — skipping.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(username, passwordHash);
  console.log(`Created user: ${user.username} (id: ${user.id})`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
