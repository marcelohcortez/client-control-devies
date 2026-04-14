import { useState, type FormEvent } from "react";
import type { Client, CreateClientInput } from "@client-control/shared";
import styles from "./ClientForm.module.css";

interface Props {
  initialValues?: Partial<Client>;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  submitLabel: string;
}

type FormValues = {
  company_name: string;
  contact_name: string;
  role: string;
  phone: string;
  email: string;
  linkedin: string;
  website_url: string;
  type_of_business: string;
  status: string;
};

export default function ClientForm({ initialValues, onSubmit, submitLabel }: Props) {
  const [values, setValues] = useState<FormValues>({
    company_name: initialValues?.company_name ?? "",
    contact_name: initialValues?.contact_name ?? "",
    role: initialValues?.role ?? "",
    phone: initialValues?.phone ?? "",
    email: initialValues?.email ?? "",
    linkedin: initialValues?.linkedin ?? "",
    website_url: initialValues?.website_url ?? "",
    type_of_business: initialValues?.type_of_business ?? "",
    status: initialValues?.status ?? "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.company_name.trim()) {
      setError("Company name is required.");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateClientInput = {
        company_name: values.company_name.trim(),
        ...(values.contact_name && { contact_name: values.contact_name }),
        ...(values.role && { role: values.role }),
        ...(values.phone && { phone: values.phone }),
        ...(values.email && { email: values.email }),
        ...(values.linkedin && { linkedin: values.linkedin }),
        ...(values.website_url && { website_url: values.website_url }),
        ...(values.type_of_business && { type_of_business: values.type_of_business }),
        ...(values.status && { status: values.status }),
      };
      await onSubmit(payload);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className={styles.form}>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <div className={styles.grid}>
        <div className={`${styles.field} ${styles.required}`}>
          <label htmlFor="company_name">Company name</label>
          <input
            id="company_name"
            type="text"
            required
            value={values.company_name}
            onChange={set("company_name")}
            aria-required="true"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact_name">Contact name</label>
          <input
            id="contact_name"
            type="text"
            value={values.contact_name}
            onChange={set("contact_name")}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="role">Role</label>
          <input
            id="role"
            type="text"
            value={values.role}
            onChange={set("role")}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={set("phone")}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={set("email")}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="linkedin">LinkedIn URL</label>
          <input
            id="linkedin"
            type="url"
            value={values.linkedin}
            onChange={set("linkedin")}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="website_url">Website URL</label>
          <input
            id="website_url"
            type="url"
            value={values.website_url}
            onChange={set("website_url")}
            placeholder="https://..."
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="type_of_business">Type of business</label>
          <input
            id="type_of_business"
            type="text"
            value={values.type_of_business}
            onChange={set("type_of_business")}
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="status">Status / Notes</label>
          <textarea
            id="status"
            rows={3}
            value={values.status}
            onChange={set("status")}
          />
        </div>
      </div>

      <p className={styles.legend}>
        <span className={styles.requiredMark}>*</span> Required field
      </p>

      <div className={styles.actions}>
        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
