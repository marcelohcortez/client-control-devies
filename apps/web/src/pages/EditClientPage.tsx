import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientForm from "../components/ClientForm";
import { apiGetClient, apiUpdateClient, apiAddContact, apiUpdateContact, apiDeleteContact } from "../services/api";
import type { Client, Contact, CreateClientInput, CreateContactInput } from "@client-control/shared";
import styles from "./FormPage.module.css";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiGetClient(Number(id))
      .then(setClient)
      .catch(() => void navigate("/clients"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleSubmit(data: CreateClientInput, contacts: CreateContactInput[]) {
    if (!id || !client) return;
    await apiUpdateClient(Number(id), data);

    const existing: Contact[] = client.additionalContacts ?? [];

    // Delete contacts that were removed (existing ones not present in new list by position)
    for (let i = contacts.length; i < existing.length; i++) {
      const c = existing[i];
      if (c) await apiDeleteContact(Number(id), c.id);
    }

    // Update or create contacts
    for (let i = 0; i < contacts.length; i++) {
      const draft = contacts[i];
      const existingContact = existing[i];
      if (!draft) continue;
      const input: CreateContactInput = {
        ...(draft.name && { name: draft.name }),
        ...(draft.role && { role: draft.role }),
        ...(draft.phone && { phone: draft.phone }),
        ...(draft.email && { email: draft.email }),
        ...(draft.linkedin && { linkedin: draft.linkedin }),
      };
      if (existingContact) {
        await apiUpdateContact(Number(id), existingContact.id, input);
      } else {
        await apiAddContact(Number(id), input);
      }
    }

    void navigate(`/clients/${id}`);
  }

  if (loading) return <p style={{ padding: "2rem", textAlign: "center" }}>Loading…</p>;
  if (!client) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => void navigate(`/clients/${id}`)}
          className={styles.back}
        >
          ← Back
        </button>
        <h1 className={styles.title}>Edit Client</h1>
      </div>

      <ClientForm
        initialValues={client}
        additionalContacts={client.additionalContacts ?? []}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
