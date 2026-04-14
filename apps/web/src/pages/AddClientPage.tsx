import { useNavigate } from "react-router-dom";
import ClientForm from "../components/ClientForm";
import { apiCreateClient } from "../services/api";
import type { CreateClientInput } from "@client-control/shared";
import styles from "./FormPage.module.css";

export default function AddClientPage() {
  const navigate = useNavigate();

  async function handleSubmit(data: CreateClientInput) {
    const client = await apiCreateClient(data);
    void navigate(`/clients/${client.id}`);
  }

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
        <h1 className={styles.title}>Add Client</h1>
      </div>

      <ClientForm onSubmit={handleSubmit} submitLabel="Add Client" />
    </div>
  );
}
