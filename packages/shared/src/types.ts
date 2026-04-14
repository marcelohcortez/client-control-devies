// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  created_at: string;
}

/** Safe public-facing user shape (no password hash) */
export interface PublicUser {
  id: number;
  username: string;
}

// ─────────────────────────────────────────────
// Client (company contact)
// ─────────────────────────────────────────────

export interface Contact {
  id: number;
  client_id: number;
  name: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  created_at: string;
}

export interface CreateContactInput {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
}

export interface Client {
  id: number;
  company_name: string;
  contact_name: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  website_url: string | null;
  type_of_business: string | null;
  status: string | null;
  added_by: string;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
  additionalContacts?: Contact[];
}

/** Fields the API accepts when creating a new client */
export interface CreateClientInput {
  company_name: string;
  contact_name?: string;
  role?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  website_url?: string;
  type_of_business?: string;
  status?: string;
}

/** Fields the API accepts when updating a client (all optional, at least one required) */
export type UpdateClientInput = Partial<CreateClientInput>;

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─────────────────────────────────────────────
// Client list filter params
// ─────────────────────────────────────────────

export interface ClientFilters {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  typeOfBusiness?: string;
  addedBy?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: PublicUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface MeResponse {
  id: number;
  username: string;
}

// ─────────────────────────────────────────────
// API error
// ─────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: unknown;
}

// ─────────────────────────────────────────────
// JWT payload (internal — used by API utils)
// ─────────────────────────────────────────────

export interface JwtPayload {
  userId: number;
  username: string;
}
