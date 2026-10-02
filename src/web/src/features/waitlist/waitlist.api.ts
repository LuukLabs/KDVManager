/* eslint-disable i18next/no-literal-string, @typescript-eslint/no-invalid-void-type -- HTTP paths, methods, headers, cache keys, and response types are protocol constants. */
import { executeFetch } from "@api/mutator/executeFetch";
import type {
  CreateWaitlistEntry,
  WaitlistEntry,
  WaitlistEntryStatus,
  WaitlistFilters,
} from "./waitlist.types";

export const waitlistQueryKey = (filters: WaitlistFilters) => ["waitlist", filters] as const;
export const waitlistEntryQueryKey = (id: string) => ["waitlist-entry", id] as const;
export const listWaitlistEntries = (filters: WaitlistFilters) => {
  const params = new URLSearchParams({ includeClosed: String(filters.includeClosed) });
  if (filters.location.trim()) params.set("location", filters.location.trim());
  if (filters.startMonth) params.set("startMonth", `${filters.startMonth}-01`);
  if (filters.status) params.set("status", filters.status);
  return executeFetch<WaitlistEntry[]>(`/crm/v1/waitlist?${params}`, { method: "GET" });
};
export const getWaitlistEntry = (id: string) =>
  executeFetch<WaitlistEntry>(`/crm/v1/waitlist/${id}`, { method: "GET" });
export const createWaitlistEntry = (entry: CreateWaitlistEntry) =>
  executeFetch<string>("/crm/v1/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
export const updateWaitlistEntry = (id: string, entry: CreateWaitlistEntry, revision: string) =>
  executeFetch<void>(`/crm/v1/waitlist/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...entry, revision }),
  });
export const updateWaitlistEntryStatus = (
  id: string,
  status: WaitlistEntryStatus,
  revision: string,
) =>
  executeFetch<void>(`/crm/v1/waitlist/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, revision }),
  });
