import i18next from "i18next";
import { GuardianRelationshipType } from "@api/models/guardianRelationshipType";

// Get human-readable label from numeric value (non-translated, internal)
export const getRelationshipLabel = (type: GuardianRelationshipType | undefined): string => {
  switch (type) {
    case GuardianRelationshipType.Parent:
  return i18next.t("guardian.relationship.parent", "Parent");
    case GuardianRelationshipType.Guardian:
  return i18next.t("guardian.relationship.guardian", "Guardian");
    case GuardianRelationshipType.Grandparent:
  return i18next.t("guardian.relationship.grandparent", "Grandparent");
    case GuardianRelationshipType.Other:
  return i18next.t("guardian.relationship.other", "Other");
    default:
  return i18next.t("guardian.relationship.unknown", "Unknown");
  }
};

// Get translated label for UI
export const getRelationshipLabelT = (type: GuardianRelationshipType | undefined): string => {
  switch (type) {
    case GuardianRelationshipType.Parent:
      return i18next.t("guardian.relationship.parent", "Parent");
    case GuardianRelationshipType.Guardian:
      return i18next.t("guardian.relationship.guardian", "Guardian");
    case GuardianRelationshipType.Grandparent:
      return i18next.t("guardian.relationship.grandparent", "Grandparent");
    case GuardianRelationshipType.Other:
      return i18next.t("guardian.relationship.other", "Other");
    default:
      return i18next.t("guardian.relationship.unknown", "Unknown");
  }
};

// Get color for chip display
export const getRelationshipColor = (
  type: GuardianRelationshipType | undefined,
): "primary" | "secondary" | "info" | "default" => {
  switch (type) {
    case GuardianRelationshipType.Parent:
      return "primary";
    case GuardianRelationshipType.Guardian:
      return "secondary";
    case GuardianRelationshipType.Grandparent:
      return "info";
    default:
      return "default";
  }
};

// Available relationship type options for forms
export const relationshipTypeOptions = [
  { value: "Mother" as const, label: i18next.t("guardian.relationship.mother", "Mother") },
  { value: "Father" as const, label: i18next.t("guardian.relationship.father", "Father") },
  { value: "Guardian" as const, label: i18next.t("guardian.relationship.guardian", "Guardian") },
  { value: "Grandparent" as const, label: i18next.t("guardian.relationship.grandparent", "Grandparent") },
  { value: "Other" as const, label: i18next.t("guardian.relationship.other", "Other") },
];
