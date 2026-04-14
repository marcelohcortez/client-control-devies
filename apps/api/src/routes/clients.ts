import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../models/clientModel";
import {
  listContactsByClientId,
  createContact,
  updateContact,
  deleteContact,
} from "../models/contactModel";

const router = Router();

// All client routes require authentication
router.use(requireAuth);

// ── GET /api/clients ──────────────────────────────────────────────────────────
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  typeOfBusiness: z.string().optional(),
  addedBy: z.string().optional(),
});

router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const result = await listClients(parsed.data);
  res.json(result);
});

// ── GET /api/clients/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid client id" });
    return;
  }

  const client = await getClientById(id);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const additionalContacts = await listContactsByClientId(id);
  res.json({ ...client, additionalContacts });
});

// ── POST /api/clients ─────────────────────────────────────────────────────────
const createSchema = z.object({
  company_name: z.string().min(1, "Company name is required").trim(),
  contact_name: z.string().trim().optional(),
  role: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  linkedin: z.string().trim().optional(),
  website_url: z.string().trim().optional(),
  type_of_business: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const username = req.user!.username;
  const client = await createClient(parsed.data, username);
  res.status(201).json(client);
});

// ── PUT /api/clients/:id ──────────────────────────────────────────────────────
const updateSchema = createSchema.partial();

router.put("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid client id" });
    return;
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const existing = await getClientById(id);
  if (!existing) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const username = req.user!.username;
  const updated = await updateClient(id, parsed.data, username);
  res.json(updated);
});

// ── DELETE /api/clients/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid client id" });
    return;
  }

  const existing = await getClientById(id);
  if (!existing) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  await deleteClient(id);
  res.json({ message: "Client deleted" });
});

// ── Contact routes ────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().trim().optional(),
  role: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  linkedin: z.string().trim().optional(),
});

// POST /api/clients/:id/contacts
router.post("/:id/contacts", async (req, res) => {
  const clientId = Number(req.params["id"]);
  if (!Number.isInteger(clientId) || clientId < 1) {
    res.status(400).json({ error: "Invalid client id" });
    return;
  }

  const client = await getClientById(clientId);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const contact = await createContact(clientId, parsed.data);
  res.status(201).json(contact);
});

// PUT /api/clients/:id/contacts/:contactId
router.put("/:id/contacts/:contactId", async (req, res) => {
  const clientId = Number(req.params["id"]);
  const contactId = Number(req.params["contactId"]);
  if (!Number.isInteger(clientId) || clientId < 1 || !Number.isInteger(contactId) || contactId < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = contactSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const contact = await updateContact(contactId, clientId, parsed.data);
  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.json(contact);
});

// DELETE /api/clients/:id/contacts/:contactId
router.delete("/:id/contacts/:contactId", async (req, res) => {
  const clientId = Number(req.params["id"]);
  const contactId = Number(req.params["contactId"]);
  if (!Number.isInteger(clientId) || clientId < 1 || !Number.isInteger(contactId) || contactId < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const deleted = await deleteContact(contactId, clientId);
  if (!deleted) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.json({ message: "Contact deleted" });
});

export default router;
