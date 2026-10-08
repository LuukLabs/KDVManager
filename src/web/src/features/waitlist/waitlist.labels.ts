import type { TFunction } from "i18next";
import type { ChildcareType, WaitlistEntryStatus } from "./waitlist.types";

export const statusLabel = (status: WaitlistEntryStatus, t: TFunction) =>
  ({
    Waiting: t("Waiting"),
    Offered: t("Offered"),
    Placed: t("Placed"),
    Withdrawn: t("Withdrawn"),
  })[status];
export const weekdayOptions = (t: TFunction) => [
  { id: 1, label: t("Monday") },
  { id: 2, label: t("Tuesday") },
  { id: 3, label: t("Wednesday") },
  { id: 4, label: t("Thursday") },
  { id: 5, label: t("Friday") },
  { id: 6, label: t("Saturday") },
  { id: 0, label: t("Sunday") },
];
export const careTypeLabel = (type: ChildcareType, t: TFunction) =>
  ({ Daycare: t("Daycare"), AfterSchool: t("After-school care") })[type];
