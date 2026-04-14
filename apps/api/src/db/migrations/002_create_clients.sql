CREATE TABLE IF NOT EXISTS clients (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name     TEXT NOT NULL,
  contact_name     TEXT,
  role             TEXT,
  phone            TEXT,
  email            TEXT,
  linkedin         TEXT,
  website_url      TEXT,
  type_of_business TEXT,
  status           TEXT,
  added_by         TEXT NOT NULL,
  last_edited_by   TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
