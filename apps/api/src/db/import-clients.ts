// One-time import script for clients from CSV
// Usage: npx tsx --env-file=../../.env.local src/db/import-clients.ts /tmp/clients_raw.csv
import fs from "fs";
import { db } from "../db/client";

const ADDED_BY = "marcelo.cortez";

function domainFrom(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function cleanUrl(url: string): string | null {
  if (!url.trim()) return null;
  const u = url.trim();
  return u.startsWith("http") ? u : `https://${u}`;
}

async function main() {
  const file = process.argv[2] ?? "/tmp/clients_raw.csv";
  const lines = fs.readFileSync(file, "utf8").split("\n");

  // skip header
  const rows = lines.slice(1).filter((l) => l.trim());

  // Parse CSV respecting quoted commas
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  let inserted = 0;
  let skipped = 0;

  for (const line of rows) {
    const [company, contact, role, email, phone, linkedin, website, status] =
      parseLine(line);

    const websiteUrl = cleanUrl(website ?? "");

    // Determine company name
    let companyName = company.trim();
    if (!companyName) {
      if (websiteUrl) {
        companyName = domainFrom(websiteUrl);
      } else {
        skipped++;
        continue;
      }
    }

    try {
      await db.execute({
        sql: `INSERT INTO clients
          (company_name, contact_name, role, email, phone, linkedin, website_url, status, added_by, last_edited_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          companyName,
          contact.trim() || null,
          role.trim() || null,
          email.trim() || null,
          phone.trim() || null,
          linkedin.trim() || null,
          websiteUrl,
          status.trim() || null,
          ADDED_BY,
          ADDED_BY,
        ],
      });
      inserted++;
      console.log(`✓ ${companyName}`);
    } catch (err) {
      console.error(`✗ ${companyName}:`, err);
      skipped++;
    }
  }

  console.log(`\nDone — inserted: ${inserted}, skipped: ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
