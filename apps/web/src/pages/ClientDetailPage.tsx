import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { apiGetClient, apiDeleteClient } from "../services/api";
import type { Client } from "@client-control/shared";
import styles from "./ClientDetailPage.module.css";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className={styles.field}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value ?? "—"}</dd>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGetClient(Number(id))
      .then(setClient)
      .catch(() => void navigate("/clients"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await apiDeleteClient(Number(id));
      void navigate("/clients");
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading)
    return <p style={{ padding: "2rem", textAlign: "center" }}>Loading…</p>;
  if (!client) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => void navigate("/clients")}
          className={styles.back}
        >
          ← Back to Clients
        </button>
        <h1 className={styles.title}>{client.company_name}</h1>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => void navigate(`/clients/${id}/edit`)}
            className={styles.editBtn}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={styles.deleteBtn}
          >
            Delete
          </button>
        </div>
      </div>

      <dl className={styles.grid}>
        <Field label="Contact name" value={client.contact_name} />
        <Field label="Role" value={client.role} />
        <Field label="Phone" value={client.phone} />
        <Field label="Email" value={client.email} />
        <Field label="LinkedIn" value={client.linkedin} />
        <Field label="Website" value={client.website_url} />
        <Field label="Type of business" value={client.type_of_business} />
        <Field label="Status / Notes" value={client.status} />
        <Field label="Added by" value={client.added_by} />
        <Field label="Last edited by" value={client.last_edited_by} />
        <Field label="Created at" value={new Date(client.created_at).toLocaleString()} />
        <Field label="Updated at" value={new Date(client.updated_at).toLocaleString()} />
      </dl>

      {showDeleteModal && (
        <ConfirmDeleteModal
          clientName={client.company_name}
          onConfirm={() => void handleDelete()}
          onCancel={() => !deleting && setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
