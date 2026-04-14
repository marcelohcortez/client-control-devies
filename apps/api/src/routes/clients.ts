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

  res.json(client);
});

// ── POST /api/clients ─────────────────────────────────────────────────────────
const createSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  type_of_business: z.string().optional(),
  status: z.string().optional(),
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

export default router;
