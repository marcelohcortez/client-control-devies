import { useState, useEffect, useCallback } from "react";
import type { ClientFilters } from "@client-control/shared";
import styles from "./FilterBar.module.css";

interface Props {
  onFilter: (filters: Omit<ClientFilters, "page" | "limit">) => void;
}

const DEBOUNCE_MS = 300;

export default function FilterBar({ onFilter }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [typeOfBusiness, setTypeOfBusiness] = useState("");
  const [addedBy, setAddedBy] = useState("");

  const hasAny =
    companyName || contactName || email || phone || typeOfBusiness || addedBy;

  const emitFilters = useCallback(
    (values: Omit<ClientFilters, "page" | "limit">) => {
      onFilter(values);
    },
    [onFilter]
  );

  useEffect(() => {
    const id = setTimeout(() => {
      const f: Omit<ClientFilters, "page" | "limit"> = {};
      if (companyName) f.companyName = companyName;
      if (contactName) f.contactName = contactName;
      if (email) f.email = email;
      if (phone) f.phone = phone;
      if (typeOfBusiness) f.typeOfBusiness = typeOfBusiness;
      if (addedBy) f.addedBy = addedBy;
      emitFilters(f);
    }, DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [companyName, contactName, email, phone, typeOfBusiness, addedBy, emitFilters]);

  function clearAll() {
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setTypeOfBusiness("");
    setAddedBy("");
  }

  return (
    <div className={styles.bar}>
      <div className={styles.inputs}>
        <input
          placeholder="Company name"
          aria-label="Filter by company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          placeholder="Contact name"
          aria-label="Filter by contact name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />
        <input
          placeholder="Email"
          aria-label="Filter by email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Phone"
          aria-label="Filter by phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="Type of business"
          aria-label="Filter by type of business"
          value={typeOfBusiness}
          onChange={(e) => setTypeOfBusiness(e.target.value)}
        />
        <input
          placeholder="Added by"
          aria-label="Filter by user who added"
          value={addedBy}
          onChange={(e) => setAddedBy(e.target.value)}
        />
      </div>

      {hasAny && (
        <button
          type="button"
          onClick={clearAll}
          className={styles.clear}
          aria-label="Clear all filters"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
