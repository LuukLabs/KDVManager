/* eslint-disable i18next/no-literal-string -- Values are API enum constants. */
export const waitlistStatuses = ["Waiting", "Offered", "Placed", "Withdrawn"] as const;
export type WaitlistEntryStatus = (typeof waitlistStatuses)[number];
export type ChildcareType = "Daycare" | "AfterSchool";

export type CreateWaitlistEntry = {
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  desiredStartDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  requestedDays?: string | null;
  notes?: string | null;
  location?: string | null;
  careType?: ChildcareType | null;
  preferredGroup?: string | null;
  weekdays: number[];
  startTime?: string | null;
  endTime?: string | null;
  priority: number;
  priorityReason?: string | null;
  priorityExplanation?: string | null;
};
export type WaitlistStatusChange = {
  previousStatus: WaitlistEntryStatus;
  status: WaitlistEntryStatus;
  changedBy: string;
  changedAt: string;
};
export type WaitlistEntry = CreateWaitlistEntry & {
  id: string;
  fullName: string;
  registeredAt: string;
  status: WaitlistEntryStatus;
  revision: string;
  statusHistory: WaitlistStatusChange[];
};
export type WaitlistFilters = {
  includeClosed: boolean;
  location: string;
  startMonth: string;
  status: WaitlistEntryStatus | "";
};
