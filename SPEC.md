# Client Control System — Specification

> **Living Document**: This file must be kept up to date. Any time a feature is added, edited, or removed, the relevant section(s) in this spec must be updated to reflect the current state of the project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Schema](#5-database-schema)
6. [API Specification](#6-api-specification)
7. [Frontend Specification](#7-frontend-specification)
8. [Security Specification](#8-security-specification)
9. [Testing Specification](#9-testing-specification)
10. [Deployment Specification](#10-deployment-specification)
11. [Implementation Tasks](#11-implementation-tasks)

---

## 1. Project Overview

A web-based client (company) management system protected behind authentication. Users can register, list, filter, view, add, edit, and delete company records. The system is scoped to internal use — only authenticated users can interact with client data.

**Key rules:**
- "Client" in this system means a company/business contact, not a user of the system.
- All write operations (add, edit, delete) require an authenticated session.
- Delete requires the user to confirm by typing `delete` in a text input.
- `added_by` and `last_edited_by` are always populated automatically from the logged-in user's username.
- Only `company_name` is required when creating a client — all other fields are optional.

---

## 2. Architecture

### Repository Structure

```
/
├── apps/
│   ├── web/                        # React + Vite + TypeScript (frontend)
│   │   ├── src/
│   │   │   ├── components/         # Reusable UI components
│   │   │   ├── pages/              # Route-level page components
│   │   │   ├── context/            # React contexts (Auth, etc.)
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── services/           # API call abstractions
│   │   │   ├── types/              # Frontend-specific types
│   │   │   └── utils/              # Utility functions
│   │   ├── e2e/                    # Playwright tests
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── api/                        # Node.js + Express + TypeScript (backend)
│       ├── src/
│       │   ├── routes/             # Express route handlers
│       │   ├── middleware/         # Auth, validation, security middleware
│       │   ├── db/                 # Turso/libsql client + queries
│       │   ├── models/             # Data access layer (typed query functions)
│       │   └── utils/              # JWT helpers, password hashing, etc.
│       └── tsconfig.json
├── packages/
│   └── shared/                     # Shared TypeScript types (Client, User, etc.)
│       └── src/
│           └── types.ts
├── .github/
│   ├── agents/                     # Custom Copilot agent definitions
│   ├── instructions/               # Scoped coding instructions
│   └── copilot-instructions.md    # Global workspace instructions
├── .env.example                    # Template — committed to version control
├── .env.local                      # Local dev secrets — git-ignored
├── .env.prod                       # Production env reference — git-ignored
├── pnpm-workspace.yaml
├── package.json                    # Root package.json (monorepo scripts)
├── tsconfig.base.json              # Shared TS config
├── eslint.config.js                # Root ESLint flat config
├── SPEC.md                         # This file
└── project-definition.md           # Original project definition
```

### Data Flow

```
Browser (React)
    └── HTTPS → Express API (Node.js / Vercel Serverless)
                    └── libsql client → Turso DB (remote SQLite)
```

### Auth Flow

```
1. User submits username + password on /login
2. API verifies credentials, returns signed JWT (short-lived, e.g. 15m)
   + refresh token (httpOnly cookie, 7d)
3. Frontend stores access token in memory (not localStorage)
4. Requests include Authorization: Bearer <token> header
5. On 401, frontend uses refresh token to silently obtain a new access token
6. Logout clears the refresh token cookie server-side
```

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript | SPA, Vite bundler |
| Backend | Node.js + Express + TypeScript | REST API |
| Database | Turso (libsql) | Remote SQLite |
| Auth | JWT (access + refresh token) | `jsonwebtoken` |
| Password Hashing | bcrypt | `bcryptjs` |
| Input Validation | Zod | Both API and frontend forms |
| HTTP Security | Helmet.js | Security headers |
| Rate Limiting | express-rate-limit | Auth endpoints |
| CORS | cors | Whitelist frontend origin |
| Testing | Playwright | E2E tests |
| Linting | ESLint (flat config) | TypeScript-aware |
| Package Manager | pnpm | Workspaces |
| Deployment | Vercel | Frontend + API serverless functions |
| Shared Types | Custom `@client-control/shared` package | Monorepo internal |

---

## 4. Environment Configuration

Three environment files are required. Secrets must never be committed.

### `.env.example` (committed — template only)

```env
# Database
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend (Vite prefix)
VITE_API_URL=http://localhost:3001
```

### `.env.local` (git-ignored — local development)

Populated with real local values.

### `.env.prod` (git-ignored — production reference)

Populated with production values. The actual secrets are configured through Vercel's environment variable settings in the dashboard — this file is a local reference only.

**Production values:**
- `DATABASE_URL`: `libsql://client-control-system-devies.aws-eu-west-1.turso.io`
- `DATABASE_AUTH_TOKEN`: *(stored in Vercel env vars, not in file)*
- `CORS_ORIGIN`: *(production frontend URL on Vercel)*

---

## 5. Database Schema

Database: Turso (libsql — SQLite-compatible). All migrations are tracked as SQL files in `apps/api/src/db/migrations/`.

### `users` table

```sql
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### `clients` table

```sql
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
```

### `contacts` table

Additional contacts per company (no limit). The primary contact fields on `clients` remain for backwards compatibility; additional contacts live here.

```sql
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
```

### `refresh_tokens` table

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 6. API Specification

Base URL (local): `http://localhost:3001/api`
Base URL (production): `https://<vercel-domain>/api`

All protected routes require `Authorization: Bearer <access_token>` header.
All request/response bodies are `application/json`.

### 6.1 Auth Routes

#### `POST /api/auth/login`

Request:
```json
{ "username": "string", "password": "string" }
```

Response `200`:
```json
{ "accessToken": "string", "user": { "id": 1, "username": "string" } }
```
Sets `refreshToken` httpOnly cookie.

Response `401`: Invalid credentials.
Response `429`: Rate limit exceeded.

---

#### `POST /api/auth/logout`

Protected. Clears `refreshToken` cookie and invalidates server-side token record.

Response `200`: `{ "message": "Logged out" }`

---

#### `POST /api/auth/refresh`

Uses `refreshToken` cookie to issue a new access token.

Response `200`: `{ "accessToken": "string" }`
Response `401`: Invalid or expired refresh token.

---

#### `GET /api/auth/me`

Protected. Returns current user from JWT.

Response `200`:
```json
{ "id": 1, "username": "string" }
```

---

### 6.2 Client Routes (all protected)

#### `GET /api/clients`

Query parameters (all optional):
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number, default `1` |
| `limit` | number | Items per page, default `10`, **max `50`** |
| `companyName` | string | Filter by company name (case-insensitive, partial) |
| `contactName` | string | Filter by contact name |
| `email` | string | Filter by email |
| `phone` | string | Filter by phone |
| `typeOfBusiness` | string | Filter by type of business |
| `addedBy` | string | Filter by user who added the record |

Response `200`:
```json
{
  "data": [ { ...client } ],
  "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

---

#### `GET /api/clients/:id`

Response `200`: Full client object including an `additionalContacts` array (from `contacts` table).
Response `404`: Client not found.

---

#### `POST /api/clients/:id/contacts`

Add an additional contact to a client.

Request body:
```json
{
  "name": "string?",
  "role": "string?",
  "phone": "string?",
  "email": "string?",
  "linkedin": "string?"
}
```

Response `201`: Created contact object.
Response `404`: Client not found.

---

#### `PUT /api/clients/:id/contacts/:contactId`

Update an additional contact.

Request body: same shape as POST (all optional).

Response `200`: Updated contact object.
Response `404`: Client or contact not found.

---

#### `DELETE /api/clients/:id/contacts/:contactId`

Remove an additional contact.

Response `200`: `{ "message": "Contact deleted" }`
Response `404`: Client or contact not found.

---

#### `POST /api/clients`

Request body:
```json
{
  "company_name": "string (required)",
  "contact_name": "string?",
  "role": "string?",
  "phone": "string?",
  "email": "string?",
  "linkedin": "string?",
  "website_url": "string?",
  "type_of_business": "string?",
  "status": "string?"
}
```

`added_by` and `last_edited_by` are set server-side from JWT.

Response `201`: Created client object.
Response `400`: Validation error (e.g. missing `company_name`).

---

#### `PUT /api/clients/:id`

Request body: same shape as POST (all fields optional, at least one required).
`last_edited_by` is updated server-side from JWT.

Response `200`: Updated client object.
Response `403`: Not authenticated.
Response `404`: Client not found.

---

#### `DELETE /api/clients/:id`

Response `200`: `{ "message": "Client deleted" }`
Response `403`: Not authenticated.
Response `404`: Client not found.

---

## 7. Frontend Specification

### 7.1 Routes

| Path | Page | Auth Required |
|------|------|--------------|
| `/` | Redirect → `/clients` if logged in, else `/login` | — |
| `/login` | Login page | No (redirect to `/clients` if already logged in) |
| `/clients` | Dashboard — clients list | Yes |
| `/clients/new` | Add client form | Yes |
| `/clients/:id` | Client detail page | Yes |
| `/clients/:id/edit` | Edit client form | Yes |

### 7.2 Pages

#### Login Page (`/login`)

- Username input
- Password input
- Submit button ("Login")
- Error message on failed authentication
- On success: redirect to `/clients`

---

#### Dashboard Page (`/clients`)

- **Header**: App name + logged-in username + Logout button
- **"Add Client" button**: navigates to `/clients/new`
- **Filter bar** (collapsible, debounced inputs):
  - Labelled "Filter" with a toggle button to expand/collapse
  - Collapsed by default
  - Filter inputs: Company name, Contact name, Email, Phone, Type of Business, Added by
- **Clients list** (paginated):
  - Each row shows: **Company name, Contact name, Phone, Email**
  - Click on a row → navigate to `/clients/:id`
- **Page size selector**: dropdown to choose items per page — options: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 (default 10)
- **Pagination controls**: prev/next + page count display

---

#### Client Detail Page (`/clients/:id`)

Displays all fields:
- Company name
- Contact name
- Role
- Phone
- Email
- LinkedIn
- Website URL
- Type of Business
- Status
- Added by / Last edited by / Dates
- **Additional contacts**: list of all contacts from `contacts` table for this client (name, role, phone, email, linkedin)

Actions:
- **Edit button** → navigate to `/clients/:id/edit`
- **Delete button** → opens confirmation modal requesting the user to type `delete`; on confirm, calls DELETE API and redirects to `/clients`

---

#### Add Client Form (`/clients/new`)

Inputs:
| Field | Type | Required |
|-------|------|---------|
| Company name | text | Yes |
| Contact name | text | No |
| Role | text | No |
| Phone | text | No |
| Email | email | No |
| LinkedIn | text (URL) | No |
| Website URL | text (URL) | No |
| Type of Business | text | No |
| Status | textarea | No |

**Additional contacts section:**
- "Add contact" button appends a new contact group with fields: Name, Role, Phone, Email, LinkedIn
- No limit on the number of additional contacts
- Each additional contact has a remove (×) button
- Additional contacts are saved to the `contacts` table after the main client is created

- `added_by` and `last_edited_by` are NOT shown — set automatically server-side.
- On success: redirect to the new client's detail page.

---

#### Edit Client Form (`/clients/:id/edit`)

Same fields as Add form, pre-populated with current values.
- Additional contacts are pre-populated from the `contacts` table.
- Existing additional contacts can be edited in-place or removed.
- New additional contacts can be added with "Add contact" button.
- `last_edited_by` is updated automatically server-side.
- On success: redirect to `/clients/:id`.

---

### 7.3 Global Components

| Component | Purpose |
|-----------|---------|
| `ProtectedRoute` | Wraps routes that require auth; redirects to `/login` |
| `AuthContext` | Provides `user`, `accessToken`, `login()`, `logout()`, `refreshToken()` |
| `ConfirmDeleteModal` | Requires typing "delete" before confirming deletion |
| `Pagination` | Reusable pagination controls |
| `FilterBar` | Collapsible filter panel with "Filter" title label; debounced inputs |
| `ClientForm` | Shared form used by both Add and Edit pages |
| `ContactFieldGroup` | Repeatable group of fields (name, role, phone, email, linkedin) for additional contacts |
| `PageSizeSelector` | Dropdown for selecting items per page (5–50 in increments of 5) |

---

## 8. Security Specification

All of these must be implemented — they are part of the project scope, not optional enhancements.

| # | Measure | Where | Implementation |
|---|---------|-------|---------------|
| 1 | Password hashing | Backend | `bcryptjs` with salt rounds ≥ 12 |
| 2 | JWT short-lived access token | Backend / Frontend | 15-minute expiry via `jsonwebtoken` |
| 3 | JWT refresh token (httpOnly cookie) | Backend / Frontend | 7-day expiry, httpOnly + Secure + SameSite=Strict |
| 4 | Refresh token rotation | Backend | Invalidate old token on each refresh; store hash in DB |
| 5 | Rate limiting on auth endpoints | Backend | `express-rate-limit`: max 10 requests / 15 min per IP on `/api/auth/*` |
| 6 | Input validation & sanitization | Backend | `zod` schemas on all request bodies; strip unknown fields |
| 7 | SQL injection prevention | Backend | Parameterized queries only (libsql client enforces this) |
| 8 | CORS whitelist | Backend | Only allow the production frontend URL (+ localhost in dev) |
| 9 | Security HTTP headers | Backend | `helmet()` on all routes |
| 10 | HTTPS enforcement | Vercel | Handled automatically by Vercel in production |
| 11 | Delete confirmation | Frontend | User must type "delete" before DELETE request is sent |
| 12 | No secrets in code/VCS | Both | `.env.local` and `.env.prod` in `.gitignore` |
| 13 | Access token in memory only | Frontend | Never stored in `localStorage` or `sessionStorage` |
| 14 | Protected routes | Frontend | Server validates JWT on every protected API call |
| 15 | General API rate limiting | Backend | `express-rate-limit`: max 200 requests / 15 min per IP on all `/api/*` routes (configurable via `API_RATE_LIMIT` env var) |

---

## 9. Testing Specification

**Tool**: Playwright (E2E)
**Location**: `apps/web/e2e/`
**Rule**: Never modify a Playwright test just to make a feature pass. Tests define expected behavior — the feature must conform to the test.
**Rule**: Playwright tests must be run after every feature is added or edited to ensure nothing is broken.

### Test Suites

#### `auth.spec.ts`
- [x] Shows login page at `/login`
- [x] Redirects unauthenticated users from protected routes to `/login`
- [x] Fails login with wrong credentials (shows error message)
- [x] Successfully logs in with valid credentials and redirects to `/clients`
- [x] Logs out and redirects to `/login`
- [x] Access token refresh — silent token renewal on expiry

#### `clients-list.spec.ts`
- [x] Displays clients list with company name and contact name
- [x] Paginates 10 records per page
- [x] Next/previous page navigation works
- [x] Filter by company name
- [x] Filter by contact name
- [x] Filter by email
- [x] Filter by phone
- [x] Filter by type of business
- [x] Filter by added by
- [x] Click on a client row navigates to the client detail page
- [x] Page size selector changes results per page
- [x] Sort by Company and Contact columns

#### `client-detail.spec.ts`
- [x] Displays all client fields on the detail page
- [x] Shows Edit and Delete buttons
- [x] `added_by` is automatically set to the logged-in username
- [x] Additional contacts section is visible when contacts exist

#### `client-add.spec.ts`
- [x] "Add Client" button navigates to `/clients/new`
- [x] Fails to submit if company name is empty
- [x] Successfully creates a client with company name only
- [x] Successfully creates a client with all fields filled
- [x] Redirects to new client's detail page after creation
- [x] `added_by` is automatically set to the logged-in username
- [x] Additional contacts can be added and appear on the detail page

#### `client-edit.spec.ts`
- [x] Edit button navigates to `/clients/:id/edit`
- [x] Form is pre-populated with current values
- [x] Successfully saves edited fields
- [x] `last_edited_by` is automatically updated after edit
- [x] Additional contact added via edit form appears on detail page

#### `client-delete.spec.ts`
- [x] Delete button opens confirmation modal
- [x] Confirmation modal requires typing "delete" to enable confirm button
- [x] Typing anything other than "delete" keeps confirm button disabled
- [x] Confirming deletion removes the client and redirects to `/clients`

---

## 10. Deployment Specification

**Platform**: Vercel

### Project Setup

- Connect GitHub repository to Vercel.
- Configure as a monorepo with two deployments:
  - `apps/web` → Vercel static frontend (Vite build)
  - `apps/api` → Vercel serverless functions (Express adapter via `@vercel/node`)

### Vercel Configuration (`vercel.json` — root level)

```json
{
  "version": 2,
  "builds": [
    { "src": "apps/api/src/index.ts", "use": "@vercel/node" },
    { "src": "apps/web/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "apps/api/src/index.ts" },
    { "src": "/(.*)", "dest": "apps/web/dist/$1" }
  ]
}
```

### Environment Variables (set in Vercel Dashboard)

- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `VITE_API_URL`

### Build Commands

| App | Build Command | Output |
|-----|--------------|--------|
| `apps/web` | `pnpm --filter web build` | `apps/web/dist/` |
| `apps/api` | TypeScript compiled at runtime by `@vercel/node` | — |

---

## 11. Implementation Tasks

Tasks are listed in the order they must be completed. Each checkbox represents a deliverable unit of work. Mark tasks as complete (`[x]`) as they are finished, and update the relevant spec section if anything changes during implementation.

### Phase 0 — Project Setup

- [x] **T-01** Initialize Git repository with `.gitignore` (node_modules, .env.local, .env.prod, dist, .turbo)
- [x] **T-02** Create monorepo structure: `apps/web`, `apps/api`, `packages/shared`
- [x] **T-03** Configure `pnpm-workspace.yaml` and root `package.json` with monorepo scripts
- [x] **T-04** Create `tsconfig.base.json` at root; extend in each app's `tsconfig.json`
- [x] **T-05** Configure ESLint flat config (`eslint.config.js`) at root — TypeScript-aware, applied to all apps
- [x] **T-06** Create `.env.example`, `.env.local`, `.env.prod` with all required keys

### Phase 1 — Shared Types

- [x] **T-07** Define shared TypeScript types in `packages/shared/src/types.ts`:
  - `User`, `Client`, `PaginatedResponse<T>`, `ApiError`, auth request/response shapes

### Phase 2 — Database

- [x] **T-08** Create Turso libsql client in `apps/api/src/db/client.ts`
- [x] **T-09** Write migration SQL files for `users`, `clients`, and `refresh_tokens` tables
- [x] **T-10** Write and run initial migration script (`apps/api/src/db/migrate.ts`)

### Phase 3 — Backend

- [x] **T-11** Scaffold Express app with TypeScript in `apps/api/src/index.ts`
- [x] **T-12** Implement security middleware stack: `helmet`, `cors`, `express-rate-limit`, JSON body parser
- [x] **T-13** Implement `apps/api/src/utils/jwt.ts` — sign/verify access + refresh tokens
- [x] **T-14** Implement `apps/api/src/utils/password.ts` — hash + compare using bcryptjs
- [x] **T-15** Implement `apps/api/src/middleware/auth.ts` — JWT verification middleware
- [x] **T-16** Implement `apps/api/src/models/userModel.ts` — find by username, create user
- [x] **T-17** Implement `apps/api/src/models/clientModel.ts` — CRUD + filtered/paginated list
- [x] **T-18** Implement `POST /api/auth/login` — validate input (Zod), verify password, return tokens
- [x] **T-19** Implement `POST /api/auth/logout` — clear refresh token cookie + DB record
- [x] **T-20** Implement `POST /api/auth/refresh` — rotate refresh token, return new access token
- [x] **T-21** Implement `GET /api/auth/me` — return user from JWT
- [x] **T-22** Implement `GET /api/clients` — with all filter params and pagination
- [x] **T-23** Implement `GET /api/clients/:id`
- [x] **T-24** Implement `POST /api/clients` — validate input, auto-fill `added_by`/`last_edited_by`
- [x] **T-25** Implement `PUT /api/clients/:id` — validate input, auto-update `last_edited_by`
- [x] **T-26** Implement `DELETE /api/clients/:id`

### Phase 4 — Frontend

- [x] **T-27** Scaffold React + Vite + TypeScript project in `apps/web`
- [x] **T-28** Install and configure React Router v6
- [x] **T-29** Create `AuthContext` with token storage in memory, `login`, `logout`, `refresh` methods
- [x] **T-30** Create `ProtectedRoute` component that redirects to `/login` if unauthenticated
- [x] **T-31** Create `apps/web/src/services/api.ts` — Axios (or fetch) wrapper with auto token refresh on 401
- [x] **T-32** Build **Login page** (`/login`)
- [x] **T-33** Build **Dashboard page** (`/clients`) — list, filter bar, pagination
- [x] **T-34** Build `FilterBar` component with debounced inputs
- [x] **T-35** Build `Pagination` component
- [x] **T-36** Build **Client Detail page** (`/clients/:id`) — display all fields
- [x] **T-37** Build `ConfirmDeleteModal` component — requires typing "delete"
- [x] **T-38** Wire delete flow: Delete button → modal → API call → redirect
- [x] **T-39** Build **Add Client form** (`/clients/new`) — Zod validation, required company_name
- [x] **T-40** Build **Edit Client form** (`/clients/:id/edit`) — pre-populated, same validation
- [x] **T-41** Set up root routing (`App.tsx`) with all routes and `ProtectedRoute` wrappers

### Phase 5 — Testing

- [x] **T-42** Install and configure Playwright in `apps/web`
- [x] **T-43** Write `auth.spec.ts` — all auth scenarios
- [x] **T-44** Write `clients-list.spec.ts` — list, filter, pagination
- [x] **T-45** Write `client-detail.spec.ts` — view all fields
- [x] **T-46** Write `client-add.spec.ts` — add client flow
- [x] **T-47** Write `client-edit.spec.ts` — edit client flow
- [x] **T-48** Write `client-delete.spec.ts` — delete with confirmation
- [x] **T-49** Run full Playwright suite; all tests must pass before deployment

### Phase 6 — Deployment

- [x] **T-50** Create root `vercel.json` with build + route configuration
- [x] **T-51** Add all required environment variables in Vercel Dashboard
- [x] **T-52** Deploy and verify production build on Vercel
- [x] **T-53** Validate all Playwright tests pass against the production URL

### Phase 7 — Improvements

#### Multi-contact support
- [x] **T-54** Add `contacts` migration: create `contacts` table with `client_id` FK + cascade delete
- [x] **T-55** Add `contactModel.ts` — create, update, delete, list by client
- [x] **T-56** Update `GET /api/clients/:id` to include `additionalContacts` array
- [x] **T-57** Add `POST /api/clients/:id/contacts` route
- [x] **T-58** Add `PUT /api/clients/:id/contacts/:contactId` route
- [x] **T-59** Add `DELETE /api/clients/:id/contacts/:contactId` route
- [x] **T-60** Update shared types: add `Contact` type; add `additionalContacts` to `Client`
- [x] **T-61** Build `ContactFieldGroup` component (name, role, phone, email, linkedin + remove button)
- [x] **T-62** Update `ClientForm` to include additional contacts section with "Add contact" button
- [x] **T-63** Update `ClientDetailPage` to display additional contacts list
- [x] **T-64** Wire add/edit form to POST/PUT/DELETE contact API endpoints on save

#### Collapsible filter bar
- [x] **T-65** Update `FilterBar` to be collapsible: add "Filter" title + toggle button; collapsed by default

#### Configurable page size
- [x] **T-66** Build `PageSizeSelector` component (dropdown: 5, 10, 15, …, 50)
- [x] **T-67** Wire `PageSizeSelector` into `DashboardPage` — passes `limit` param to API, resets to page 1 on change

#### Updated list columns
- [x] **T-68** Update dashboard table to show: Company name, Contact name, Phone, Email
- [x] **T-69** Run full Playwright suite; fix any broken tests; update tests to reflect new columns/behaviour
- [x] **T-70** Deploy Phase 7 to production and validate

#### UX & security polish
- [x] **T-71** Move per-page selector below pagination
- [x] **T-72** Accept URL inputs without protocol (`www.`, bare domain, `http://`, `https://`) — auto-prepend `https://` on save
- [x] **T-73** Sanitize all user-input fields: trim whitespace on frontend and backend (Zod `.trim()` on all string fields)
- [x] **T-74** Sort clients list by Company or Contact column: click header to sort ascending, click again to sort descending; `⇅` / `▲` / `▼` indicator; server-side ORDER BY
- [x] **T-75** Comprehensive Playwright coverage: audit all spec features against test suites; add missing tests for all filter types, pagination, page-size selector, sort columns, `added_by`/`last_edited_by` auto-set, additional contacts (add & edit flows), and protected route redirect
- [x] **T-76** Add general API rate limiter (`express-rate-limit`) to all `/api/*` routes — max 200 req/15 min in production; add `API_RATE_LIMIT` env var; cap `limit` query param at 50 to match UI maximum
- [x] **T-77** Playwright test for silent token refresh: simulate 401 via `page.route()`, verify Axios interceptor calls `/refresh` and retries the original request

---

*Last updated: 2026-04-15 — Phases 0–7 complete (T-01 → T-70); UX & security polish (T-71–T-74); full Playwright coverage + token refresh test (T-75, T-77); general API rate limiting + pagination cap (T-76). Deployed to https://client-control-devies-api.vercel.app*
