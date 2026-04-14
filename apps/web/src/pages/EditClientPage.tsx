import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientForm from "../components/ClientForm";
import { apiGetClient, apiUpdateClient } from "../services/api";
import type { Client, CreateClientInput } from "@client-control/shared";
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

  async function handleSubmit(data: CreateClientInput) {
    if (!id) return;
    await apiUpdateClient(Number(id), data);
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
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
