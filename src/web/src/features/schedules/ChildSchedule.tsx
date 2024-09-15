import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/models/childListVM";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import NiceModal from "@ebay/nice-modal-react";
import AddIcon from "@mui/icons-material/Add";
import { AddChildScheduleDialog } from "./AddChildScheduleDialog";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useGetChildSchedules } from "@api/endpoints/schedules/schedules";
import { scheduleRulesFormatter } from "../../utils/scheduleRulesFormatter";

const columns: GridColDef[] = [
  {
    field: "startDate",
    headerName: "StartDate",
    flex: 1,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (value) => value && dayjs(value).format("DD/MM/YYYY"),
  },
  {
    field: "endDate",
    headerName: "EndDate",
    flex: 1,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (value) => value && dayjs(value).format("DD/MM/YYYY"),
  },
  {
    field: "scheduleRules",
    headerName: "WeekSchedule",
    flex: 1,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (value) => value && scheduleRulesFormatter(value),
  },
];

type ChildScheduleProps = {
  childId: string;
};

export const ChildSchedule: React.FC<ChildScheduleProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching } = useGetChildSchedules({
    ChildId: childId,
  });

  const onAddChildScheduleClickHandler = () =>
    void NiceModal.show(AddChildScheduleDialog, { childId: childId });

  return (
    <>
      <Toolbar>
        <Button
          variant="contained"
          onClick={onAddChildScheduleClickHandler}
          startIcon={<AddIcon />}
        >
          {t("Schedule")}
        </Button>
      </Toolbar>
      <DataGrid<ChildListVM>
        autoHeight
        loading={isLoading || isFetching}
        columns={columns}
        rows={data || []}
      />
    </>
  );
};
