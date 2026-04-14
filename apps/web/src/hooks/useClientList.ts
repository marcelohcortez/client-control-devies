import { useState, useEffect } from "react";
import type { Client, ClientFilters, PaginatedResponse, PaginationMeta } from "@client-control/shared";

interface State {
  clients: Client[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: boolean;
}

export function useClientList(
  filters: ClientFilters,
  fetcher: (f: ClientFilters) => Promise<PaginatedResponse<Client>>
): State {
  const [state, setState] = useState<State>({
    clients: [],
    pagination: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));

    fetcher(filters)
      .then((data) => {
        if (cancelled) return;
        setState({
          clients: data.data,
          pagination: data.pagination,
          loading: false,
          error: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ clients: [], pagination: null, loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return state;
}
