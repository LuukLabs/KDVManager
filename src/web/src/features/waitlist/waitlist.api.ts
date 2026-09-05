import { executeFetch } from "@api/mutator/executeFetch";
import type { CreateWaitlistEntry, WaitlistEntry, WaitlistEntryStatus } from "./waitlist.types";

export const waitlistQueryKey = (includeClosed: boolean) => ["waitlist", includeClosed] as const;

export const listWaitlistEntries = (includeClosed: boolean) =>
  executeFetch<WaitlistEntry[]>(`/crm/v1/waitlist?includeClosed=${includeClosed}`, {
    method: "GET",
  });

export const createWaitlistEntry = (entry: CreateWaitlistEntry) =>
  executeFetch<string>("/crm/v1/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

export const updateWaitlistEntryStatus = (id: string, status: WaitlistEntryStatus) =>
  executeFetch<void>(`/crm/v1/waitlist/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
