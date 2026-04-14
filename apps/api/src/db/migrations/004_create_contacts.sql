CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name       TEXT,
  role       TEXT,
  phone      TEXT,
  email      TEXT,
  linkedin   TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
