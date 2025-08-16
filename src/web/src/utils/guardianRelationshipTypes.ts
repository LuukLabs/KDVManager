import { GuardianRelationshipType } from "@api/models/guardianRelationshipType";

// Get human-readable label from numeric value
export const getRelationshipLabel = (type: GuardianRelationshipType | undefined): string => {
  switch (type) {
    case GuardianRelationshipType.Parent:
      return "Parent";
    case GuardianRelationshipType.Guardian:
      return "Guardian";
    case GuardianRelationshipType.Grandparent:
      return "Grandparent";
    case GuardianRelationshipType.Other:
      return "Other";
    default:
      return "Unknown";
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
  { value: "Mother" as const, label: "Mother" },
  { value: "Father" as const, label: "Father" },
  { value: "Guardian" as const, label: "Guardian" },
  { value: "Grandparent" as const, label: "Grandparent" },
  { value: "Other" as const, label: "Other" },
];
