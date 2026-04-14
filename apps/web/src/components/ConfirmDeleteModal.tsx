import { useState, useEffect, useRef } from "react";
import styles from "./ConfirmDeleteModal.module.css";

const CONFIRM_WORD = "delete";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  clientName: string;
}

export default function ConfirmDeleteModal({
  onConfirm,
  onCancel,
  clientName,
}: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isConfirmed = input === CONFIRM_WORD;

  // Focus the input when the modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Trap focus: close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onCancel}
        aria-hidden="true"
      />

      <dialog
        open
        className={styles.modal}
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <h2 id="delete-modal-title" className={styles.title}>
          Delete Client
        </h2>

        <p className={styles.body}>
          You are about to permanently delete{" "}
          <strong>{clientName}</strong>. This action cannot be undone.
        </p>

        <p className={styles.instruction}>
          Type <strong>delete</strong> to confirm:
        </p>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type "delete" to confirm'
          aria-label='Type the word "delete" to confirm deletion'
          className={styles.input}
          autoComplete="off"
        />

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed}
            className={styles.deleteBtn}
          >
            Delete Client
          </button>
        </div>
      </dialog>
    </>
  );
}
