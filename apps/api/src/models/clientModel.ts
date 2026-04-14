import { db } from "../db/client";
import type { InValue } from "@libsql/client";
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientFilters,
  PaginatedResponse,
} from "@client-control/shared";

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row["id"] as number,
    company_name: row["company_name"] as string,
    contact_name: (row["contact_name"] as string | null) ?? null,
    role: (row["role"] as string | null) ?? null,
    phone: (row["phone"] as string | null) ?? null,
    email: (row["email"] as string | null) ?? null,
    linkedin: (row["linkedin"] as string | null) ?? null,
    website_url: (row["website_url"] as string | null) ?? null,
    type_of_business: (row["type_of_business"] as string | null) ?? null,
    status: (row["status"] as string | null) ?? null,
    added_by: row["added_by"] as string,
    last_edited_by: (row["last_edited_by"] as string | null) ?? null,
    created_at: row["created_at"] as string,
    updated_at: row["updated_at"] as string,
  };
}

export async function listClients(
  filters: ClientFilters
): Promise<PaginatedResponse<Client>> {
  const {
    companyName,
    contactName,
    email,
    phone,
    typeOfBusiness,
    addedBy,
    page = 1,
    limit = 10,
    sortBy,
    sortDir,
  } = filters;

  const ALLOWED_SORT_COLS = ["company_name", "contact_name"] as const;
  const col = sortBy && (ALLOWED_SORT_COLS as readonly string[]).includes(sortBy) ? sortBy : null;
  const dir = sortDir === "asc" ? "ASC" : sortDir === "desc" ? "DESC" : null;

  const conditions: string[] = [];
  const args: InValue[] = [];

  if (companyName) {
    conditions.push("LOWER(company_name) LIKE LOWER(?)");
    args.push(`%${companyName}%`);
  }
  if (contactName) {
    conditions.push("LOWER(contact_name) LIKE LOWER(?)");
    args.push(`%${contactName}%`);
  }
  if (email) {
    conditions.push("LOWER(email) LIKE LOWER(?)");
    args.push(`%${email}%`);
  }
  if (phone) {
    conditions.push("phone LIKE ?");
    args.push(`%${phone}%`);
  }
  if (typeOfBusiness) {
    conditions.push("LOWER(type_of_business) LIKE LOWER(?)");
    args.push(`%${typeOfBusiness}%`);
  }
  if (addedBy) {
    conditions.push("LOWER(added_by) LIKE LOWER(?)");
    args.push(`%${addedBy}%`);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total matching rows
  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM clients ${where}`,
    args,
  });
  const total = (countResult.rows[0]?.["total"] as number | bigint) ?? 0;
  const totalNumber = typeof total === "bigint" ? Number(total) : total;

  // Fetch page
  const offset = (page - 1) * limit;
  const orderBy = col && dir ? `LOWER(${col}) ${dir}` : "created_at DESC";
  const dataResult = await db.execute({
    sql: `SELECT * FROM clients ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return {
    data: dataResult.rows.map((row) =>
      rowToClient(row as Record<string, unknown>)
    ),
    pagination: {
      page,
      limit,
      total: totalNumber,
      totalPages: Math.ceil(totalNumber / limit),
    },
  };
}

export async function getClientById(id: number): Promise<Client | null> {
  const result = await db.execute({
    sql: "SELECT * FROM clients WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  if (!row) return null;

  return rowToClient(row as Record<string, unknown>);
}

export async function createClient(
  input: CreateClientInput,
  addedBy: string
): Promise<Client> {
  const result = await db.execute({
    sql: `INSERT INTO clients
      (company_name, contact_name, role, phone, email, linkedin, website_url, type_of_business, status, added_by, last_edited_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *`,
    args: [
      input.company_name,
      input.contact_name ?? null,
      input.role ?? null,
      input.phone ?? null,
      input.email ?? null,
      input.linkedin ?? null,
      input.website_url ?? null,
      input.type_of_business ?? null,
      input.status ?? null,
      addedBy,
      addedBy,
    ],
  });

  const row = result.rows[0];
  if (!row) throw new Error("Failed to create client");

  return rowToClient(row as Record<string, unknown>);
}

export async function updateClient(
  id: number,
  input: UpdateClientInput,
  editedBy: string
): Promise<Client | null> {
  const fields: string[] = [];
  const args: InValue[] = [];

  if (input.company_name !== undefined) {
    fields.push("company_name = ?");
    args.push(input.company_name);
  }
  if (input.contact_name !== undefined) {
    fields.push("contact_name = ?");
    args.push(input.contact_name);
  }
  if (input.role !== undefined) {
    fields.push("role = ?");
    args.push(input.role);
  }
  if (input.phone !== undefined) {
    fields.push("phone = ?");
    args.push(input.phone);
  }
  if (input.email !== undefined) {
    fields.push("email = ?");
    args.push(input.email);
  }
  if (input.linkedin !== undefined) {
    fields.push("linkedin = ?");
    args.push(input.linkedin);
  }
  if (input.website_url !== undefined) {
    fields.push("website_url = ?");
    args.push(input.website_url);
  }
  if (input.type_of_business !== undefined) {
    fields.push("type_of_business = ?");
    args.push(input.type_of_business);
  }
  if (input.status !== undefined) {
    fields.push("status = ?");
    args.push(input.status);
  }

  if (fields.length === 0) return getClientById(id);

  fields.push("last_edited_by = ?");
  args.push(editedBy);

  const result = await db.execute({
    sql: `UPDATE clients SET ${fields.join(", ")}, updated_at = datetime('now') WHERE id = ? RETURNING *`,
    args: [...args, id],
  });

  const row = result.rows[0];
  if (!row) return null;

  return rowToClient(row as Record<string, unknown>);
}

export async function deleteClient(id: number): Promise<boolean> {
  const result = await db.execute({
    sql: "DELETE FROM clients WHERE id = ?",
    args: [id],
  });

  return (result.rowsAffected ?? 0) > 0;
}
