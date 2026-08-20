import NiceModal from "@ebay/nice-modal-react";
import { ChildScheduleDialog, type ScheduleToEdit } from "./ChildScheduleDialog";

export type EditChildScheduleDialogProps = {
  childId: string;
  /**
   * No `endDate`: it was never read by the editor, and the PUT only replaces
   * `startDate` plus the rule collection.
   */
  schedule: ScheduleToEdit;
};

/**
 * NiceModal wrapper around the shared planning editor.
 *
 * The filename and the export name are deliberately unchanged so
 * `ChildScheduleTimeline.tsx` keeps working.
 */
export const EditChildScheduleDialog = NiceModal.create<EditChildScheduleDialogProps>(
  ({ childId, schedule }) => (
    <ChildScheduleDialog mode="edit" childId={childId} schedule={schedule} />
  ),
);
