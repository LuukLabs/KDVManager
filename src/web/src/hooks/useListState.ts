import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { type DataGridProps, type GridPaginationModel } from "@mui/x-data-grid";

type ListState = {
  pageNumber: number; // 1-based
  pageSize: number;
  search: string;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/**
 * URL-driven list state (pagination + search) shared by all list pages.
 *
 * The URL is the single source of truth (`page`, `size`, `q`), so pagination
 * survives navigation and links are shareable. The state is mirrored to
 * localStorage under `storageKey` and restored when the page is opened
 * without explicit URL params. Add a bound `useXxxListState` hook below for
 * each list page so table and page share the same storage key.
 */
const useListState = (storageKey: string) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo<ListState>(
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
      const ls = localStorage.getItem(storageKey);
      if (ls) {
        try {
          const fromStorage: Partial<ListState> = JSON.parse(ls);
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
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, state]);

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

const CHILDREN_STORAGE_KEY = "childrenListState";
const GUARDIANS_STORAGE_KEY = "guardiansListState";
const GROUPS_STORAGE_KEY = "groupsListState";
const TIME_SLOTS_STORAGE_KEY = "timeSlotsListState";

export const useChildrenListState = () => useListState(CHILDREN_STORAGE_KEY);
export const useGuardiansListState = () => useListState(GUARDIANS_STORAGE_KEY);
export const useGroupsListState = () => useListState(GROUPS_STORAGE_KEY);
export const useTimeSlotsListState = () => useListState(TIME_SLOTS_STORAGE_KEY);
