import { createClient } from "@libsql/client";

const url = process.env["DATABASE_URL"];
const authToken = process.env["DATABASE_AUTH_TOKEN"];

if (!url) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!authToken) {
  throw new Error("DATABASE_AUTH_TOKEN environment variable is required");
}

export const db = createClient({ url, authToken });
