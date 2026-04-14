import styles from "./ContactFieldGroup.module.css";

interface ContactData {
  name: string;
  role: string;
  phone: string;
  email: string;
  linkedin: string;
}

interface Props {
  contact: ContactData;
  index: number;
  onChange: (index: number, field: keyof ContactData, value: string) => void;
  onRemove: (index: number) => void;
}

export default function ContactFieldGroup({ contact, index, onChange, onRemove }: Props) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <span className={styles.groupTitle}>Contact {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className={styles.removeBtn}
          aria-label={`Remove contact ${index + 1}`}
        >
          ×
        </button>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`contact_${index}_name`}>Name</label>
          <input
            id={`contact_${index}_name`}
            type="text"
            value={contact.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`contact_${index}_role`}>Role</label>
          <input
            id={`contact_${index}_role`}
            type="text"
            value={contact.role}
            onChange={(e) => onChange(index, "role", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`contact_${index}_phone`}>Phone</label>
          <input
            id={`contact_${index}_phone`}
            type="tel"
            value={contact.phone}
            onChange={(e) => onChange(index, "phone", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`contact_${index}_email`}>Email</label>
          <input
            id={`contact_${index}_email`}
            type="email"
            value={contact.email}
            onChange={(e) => onChange(index, "email", e.target.value)}
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor={`contact_${index}_linkedin`}>LinkedIn URL</label>
          <input
            id={`contact_${index}_linkedin`}
            type="text"
            value={contact.linkedin}
            onChange={(e) => onChange(index, "linkedin", e.target.value)}
            placeholder="linkedin.com/in/..."
          />
        </div>
      </div>
    </div>
  );
}
