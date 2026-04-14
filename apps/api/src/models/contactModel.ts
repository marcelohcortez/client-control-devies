import { db } from "../db/client";
import type { InValue } from "@libsql/client";
import type { Contact, CreateContactInput } from "@client-control/shared";

function rowToContact(row: Record<string, unknown>): Contact {
  return {
    id: row["id"] as number,
    client_id: row["client_id"] as number,
    name: (row["name"] as string | null) ?? null,
    role: (row["role"] as string | null) ?? null,
    phone: (row["phone"] as string | null) ?? null,
    email: (row["email"] as string | null) ?? null,
    linkedin: (row["linkedin"] as string | null) ?? null,
    created_at: row["created_at"] as string,
  };
}

export async function listContactsByClientId(
  clientId: number
): Promise<Contact[]> {
  const result = await db.execute({
    sql: "SELECT * FROM contacts WHERE client_id = ? ORDER BY id ASC",
    args: [clientId] as InValue[],
  });
  return result.rows.map((row) => rowToContact(row as Record<string, unknown>));
}

export async function createContact(
  clientId: number,
  input: CreateContactInput
): Promise<Contact> {
  const result = await db.execute({
    sql: `INSERT INTO contacts (client_id, name, role, phone, email, linkedin)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *`,
    args: [
      clientId,
      input.name ?? null,
      input.role ?? null,
      input.phone ?? null,
      input.email ?? null,
      input.linkedin ?? null,
    ] as InValue[],
  });

  const row = result.rows[0];
  if (!row) throw new Error("Failed to create contact");

  return rowToContact(row as Record<string, unknown>);
}

export async function updateContact(
  id: number,
  clientId: number,
  input: Partial<CreateContactInput>
): Promise<Contact | null> {
  const fields: string[] = [];
  const args: InValue[] = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    args.push(input.name || null);
  }
  if (input.role !== undefined) {
    fields.push("role = ?");
    args.push(input.role || null);
  }
  if (input.phone !== undefined) {
    fields.push("phone = ?");
    args.push(input.phone || null);
  }
  if (input.email !== undefined) {
    fields.push("email = ?");
    args.push(input.email || null);
  }
  if (input.linkedin !== undefined) {
    fields.push("linkedin = ?");
    args.push(input.linkedin || null);
  }

  if (fields.length === 0) {
    // Nothing to update — return the existing record
    const existing = await db.execute({
      sql: "SELECT * FROM contacts WHERE id = ? AND client_id = ?",
      args: [id, clientId] as InValue[],
    });
    const row = existing.rows[0];
    if (!row) return null;
    return rowToContact(row as Record<string, unknown>);
  }

  args.push(id, clientId);

  const result = await db.execute({
    sql: `UPDATE contacts SET ${fields.join(", ")} WHERE id = ? AND client_id = ? RETURNING *`,
    args,
  });

  const row = result.rows[0];
  if (!row) return null;

  return rowToContact(row as Record<string, unknown>);
}

export async function deleteContact(
  id: number,
  clientId: number
): Promise<boolean> {
  const result = await db.execute({
    sql: "DELETE FROM contacts WHERE id = ? AND client_id = ?",
    args: [id, clientId] as InValue[],
  });

  return (result.rowsAffected ?? 0) > 0;
}
