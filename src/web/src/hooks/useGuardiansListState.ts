import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { type DataGridProps, type GridPaginationModel } from "@mui/x-data-grid";

// Key for localStorage persistence
const STORAGE_KEY = "guardiansListState";

export type GuardiansListState = {
  pageNumber: number; // 1-based
  pageSize: number;
  search: string;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const useGuardiansListState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial state from URL or localStorage
  const [state, setState] = useState<GuardiansListState>(() => {
    const ls = localStorage.getItem(STORAGE_KEY);
    let fromStorage: Partial<GuardiansListState> = {};
    if (ls) {
      try {
        fromStorage = JSON.parse(ls);
      } catch {
        /* ignore */
      }
    }
    return {
      pageNumber: parsePositiveInt(searchParams.get("page"), fromStorage.pageNumber ?? 1),
      pageSize: parsePositiveInt(searchParams.get("size"), fromStorage.pageSize ?? 10),
      search: searchParams.get("q") ?? fromStorage.search ?? "",
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Sync URL (replace to avoid history spam)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", state.pageNumber.toString());
    params.set("size", state.pageSize.toString());
    if (state.search) params.set("q", state.search);
    else params.delete("q");
    setSearchParams(params, { replace: true });
  }, [state, searchParams, setSearchParams]);

  // React to external URL changes (e.g. another hook instance updated params)
  useEffect(() => {
    const spPage = parsePositiveInt(searchParams.get("page"), state.pageNumber);
    const spSize = parsePositiveInt(searchParams.get("size"), state.pageSize);
    const spSearch = searchParams.get("q") ?? "";
    if (spPage !== state.pageNumber || spSize !== state.pageSize || spSearch !== state.search) {
      setState({ pageNumber: spPage, pageSize: spSize, search: spSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onPaginationModelChange = useCallback((model: GridPaginationModel) => {
    setState((s) => ({ ...s, pageNumber: model.page + 1, pageSize: model.pageSize }));
  }, []);

  const setSearch = useCallback((value: string) => {
    setState((s) => ({ ...s, pageNumber: 1, search: value }));
  }, []);

  const apiParams = useMemo(() => {
    const p: { pageNumber: number; pageSize: number; search?: string } = {
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
