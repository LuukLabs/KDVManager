import NiceModal from "@ebay/nice-modal-react";
import { ChildScheduleDialog } from "./ChildScheduleDialog";

export type AddChildScheduleDialogProps = {
  childId: string;
};

/**
 * NiceModal wrapper around the shared planning editor.
 *
 * The filename and the export name are deliberately unchanged so
 * `PlanningTab.tsx` keeps working; everything the dialog does lives in
 * `ChildScheduleDialog`.
 */
export const AddChildScheduleDialogV2 = NiceModal.create<AddChildScheduleDialogProps>(
  ({ childId }) => <ChildScheduleDialog mode="add" childId={childId} />,
);
