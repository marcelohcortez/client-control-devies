import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { db } from "./client";

async function migrate(): Promise<void> {
  const migrationsDir = join(__dirname, "migrations");

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Running ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8").trim();
    if (!sql) continue;

    console.log(`  → ${file}`);
    await db.execute(sql);
  }

  console.log("Migrations complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
