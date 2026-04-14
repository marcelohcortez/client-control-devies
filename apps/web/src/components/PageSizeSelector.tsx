interface Props {
  value: number;
  onChange: (size: number) => void;
}

export default function PageSizeSelector({ value, onChange }: Props) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
      Per page:
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.875rem" }}
      >
        {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </label>
  );
}
