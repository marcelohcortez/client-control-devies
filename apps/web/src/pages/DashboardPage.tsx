import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import PageSizeSelector from "../components/PageSizeSelector";
import { apiGetClients } from "../services/api";
import { useClientList } from "../hooks/useClientList";
import type { ClientFilters } from "@client-control/shared";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Omit<ClientFilters, "page" | "limit">>();
  const [sortBy, setSortBy] = useState<"company_name" | "contact_name" | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { clients, pagination, loading, error } = useClientList(
    {
      ...filters,
      page,
      limit,
      ...(sortBy && { sortBy, sortDir }),
    },
    apiGetClients
  );

  function handleSort(col: "company_name" | "contact_name") {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  const handleFilter = useCallback(
    (f: Omit<ClientFilters, "page" | "limit">) => {
      setFilters(f);
      setPage(1);
    },
    []
  );

  async function handleLogout() {
    await logout();
    void navigate("/login");
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.brand}>Client Control</h1>
        <div className={styles.headerRight}>
          <span className={styles.username}>
            Logged in as <strong>{user?.username}</strong>
          </span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h2 className={styles.pageTitle}>Clients</h2>
          <Link to="/clients/new" className={styles.addBtn}>
            + Add Client
          </Link>
        </div>

        <FilterBar onFilter={handleFilter} />

        {error && (
          <p role="alert" className={styles.error}>
            Failed to load clients. Please try again.
          </p>
        )}

        {loading && <p className={styles.loading}>Loading…</p>}

        {!loading && !error && (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className={styles.sortable}
                    onClick={() => handleSort("company_name")}
                    aria-sort={sortBy === "company_name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Company
                    <span className={styles.sortIcon} aria-hidden="true">
                      {sortBy === "company_name" ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅"}
                    </span>
                  </th>
                  <th
                    scope="col"
                    className={styles.sortable}
                    onClick={() => handleSort("contact_name")}
                    aria-sort={sortBy === "contact_name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Contact
                    <span className={styles.sortIcon} aria-hidden="true">
                      {sortBy === "contact_name" ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅"}
                    </span>
                  </th>
                  <th scope="col">Phone</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.empty}>No clients found.</td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr
                      key={c.id}
                      className={styles.row}
                      onClick={() => void navigate(`/clients/${c.id}`)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          void navigate(`/clients/${c.id}`);
                        }
                      }}
                      role="link"
                      aria-label={`View ${c.company_name}`}
                    >
                      <td>{c.company_name}</td>
                      <td>{c.contact_name ?? "—"}</td>
                      <td>{c.phone ?? "—"}</td>
                      <td>{c.email ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            )}
            <div className={styles.pageSizeRow}>
              <PageSizeSelector value={limit} onChange={(s) => { setLimit(s); setPage(1); }} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
