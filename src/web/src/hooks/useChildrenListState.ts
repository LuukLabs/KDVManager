import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { type DataGridProps, type GridPaginationModel } from "@mui/x-data-grid";

// Key for localStorage persistence
const STORAGE_KEY = "childrenListState";

export type ChildrenListState = {
  pageNumber: number; // 1-based
  pageSize: number;
  search: string;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const useChildrenListState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state directly from URL params — no local state needed
  const state = useMemo<ChildrenListState>(
    () => ({
      pageNumber: parsePositiveInt(searchParams.get("page"), 1),
      pageSize: parsePositiveInt(searchParams.get("size"), 10),
      search: searchParams.get("q") ?? "",
    }),
    [searchParams],
  );

  // Initialize URL from localStorage on first mount if URL has no params
  useEffect(() => {
    if (!searchParams.has("page") && !searchParams.has("size")) {
      const ls = localStorage.getItem(STORAGE_KEY);
      if (ls) {
        try {
          const fromStorage: Partial<ChildrenListState> = JSON.parse(ls);
          const params = new URLSearchParams(searchParams);
          params.set("page", String(fromStorage.pageNumber ?? 1));
          params.set("size", String(fromStorage.pageSize ?? 10));
          if (fromStorage.search) params.set("q", fromStorage.search);
          setSearchParams(params, { replace: true });
        } catch {
          /* ignore */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const onPaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set("page", String(model.page + 1));
          params.set("size", String(model.pageSize));
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set("page", "1");
          if (value) params.set("q", value);
          else params.delete("q");
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const apiParams = useMemo(() => {
    const p: Record<string, unknown> = {
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
    };
    if (state.search.trim()) p.search = state.search.trim();
    return p;
  }, [state]);

  const muiPagination = useMemo<
    Pick<DataGridProps, "paginationMode" | "onPaginationModelChange" | "paginationModel">
  >(
    () => ({
      paginationMode: "server",
      onPaginationModelChange,
      paginationModel: { page: state.pageNumber - 1, pageSize: state.pageSize },
    }),
    [state.pageNumber, state.pageSize, onPaginationModelChange],
  );

  return { state, setSearch, apiParams, muiPagination };
};
