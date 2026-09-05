export const waitlistStatuses = ["Waiting", "Offered", "Placed", "Withdrawn"] as const;

export type WaitlistEntryStatus = (typeof waitlistStatuses)[number];

export type WaitlistEntry = {
  id: string;
  givenName: string;
  familyName: string;
  fullName: string;
  dateOfBirth: string;
  desiredStartDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  requestedDays?: string | null;
  notes?: string | null;
  registeredAt: string;
  status: WaitlistEntryStatus;
};

export type CreateWaitlistEntry = {
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  desiredStartDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  requestedDays?: string;
  notes?: string;
};
