import { useState, type FormEvent } from "react";
import type { Client, Contact, CreateClientInput, CreateContactInput } from "@client-control/shared";
import styles from "./ClientForm.module.css";
import ContactFieldGroup from "./ContactFieldGroup";

interface ContactDraft {
  name: string;
  role: string;
  phone: string;
  email: string;
  linkedin: string;
}

interface Props {
  initialValues?: Partial<Client>;
  additionalContacts?: Contact[];
  onSubmit: (data: CreateClientInput, contacts: CreateContactInput[]) => Promise<void>;
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

export default function ClientForm({ initialValues, additionalContacts, onSubmit, submitLabel }: Props) {
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

  const [contacts, setContacts] = useState<ContactDraft[]>(
    (additionalContacts ?? []).map((c) => ({
      name: c.name ?? "",
      role: c.role ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      linkedin: c.linkedin ?? "",
    }))
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  function handleContactChange(index: number, field: keyof ContactDraft, value: string) {
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function handleContactRemove(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  function addContact() {
    setContacts((prev) => [...prev, { name: "", role: "", phone: "", email: "", linkedin: "" }]);
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
        ...(values.website_url && {
          website_url:
            values.website_url.match(/^https?:\/\//)
              ? values.website_url
              : `https://${values.website_url}`,
        }),
        ...(values.type_of_business && { type_of_business: values.type_of_business }),
        ...(values.status && { status: values.status }),
      };

      const contactInputs: CreateContactInput[] = contacts
        .filter((c) => c.name || c.role || c.phone || c.email || c.linkedin)
        .map((c) => ({
          ...(c.name && { name: c.name }),
          ...(c.role && { role: c.role }),
          ...(c.phone && { phone: c.phone }),
          ...(c.email && { email: c.email }),
          ...(c.linkedin && { linkedin: c.linkedin }),
        }));

      await onSubmit(payload, contactInputs);
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

      <div className={styles.contactsSection}>
        <h3 className={styles.contactsTitle}>Additional Contacts</h3>
        {contacts.map((contact, i) => (
          <ContactFieldGroup
            key={i}
            contact={contact}
            index={i}
            onChange={handleContactChange}
            onRemove={handleContactRemove}
          />
        ))}
        <button
          type="button"
          onClick={addContact}
          className={styles.addContactBtn}
        >
          + Add contact
        </button>
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
