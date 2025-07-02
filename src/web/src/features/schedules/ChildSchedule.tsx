import { DataGrid, type GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/models/childListVM";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import NiceModal from "@ebay/nice-modal-react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { AddChildScheduleDialog } from "./AddChildScheduleDialog";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  useGetChildSchedules,
  useDeleteSchedule,
  getGetChildSchedulesQueryKey,
} from "@api/endpoints/schedules/schedules";
import { scheduleRulesFormatter } from "../../utils/scheduleRulesFormatter";

type ChildScheduleProps = {
  childId: string;
};

export const ChildSchedule: React.FC<ChildScheduleProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useGetChildSchedules({
    ChildId: childId,
  });
  const deleteScheduleMutation = useDeleteSchedule();

  const onAddChildScheduleClickHandler = () =>
    void NiceModal.show(AddChildScheduleDialog, { childId: childId });

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm(t("Are you sure you want to delete this schedule?"))) {
      try {
        await deleteScheduleMutation.mutateAsync({ id: scheduleId });
        enqueueSnackbar(t("Schedule deleted successfully"), { variant: "success" });
        await queryClient.invalidateQueries({
          queryKey: getGetChildSchedulesQueryKey({ ChildId: childId }),
        });
      } catch {
        enqueueSnackbar(t("Failed to delete schedule"), { variant: "error" });
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "startDate",
      headerName: "StartDate",
      width: 120,
      disableColumnMenu: true,
      disableReorder: true,
      valueFormatter: (value) => value && dayjs(value).format("DD/MM/YYYY"),
    },
    {
      field: "endDate",
      headerName: "EndDate",
      width: 120,
      disableColumnMenu: true,
      disableReorder: true,
      valueFormatter: (value) => value && dayjs(value).format("DD/MM/YYYY"),
    },
    {
      field: "groupName",
      headerName: "Group",
      width: 150,
      disableColumnMenu: true,
      disableReorder: true,
    },
    {
      field: "scheduleRules",
      headerName: "WeekSchedule",
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      disableReorder: true,
      valueFormatter: (value) => value && scheduleRulesFormatter(value),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      disableColumnMenu: true,
      disableReorder: true,
      getActions: (params) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label={t("Delete")}
          onClick={() => handleDeleteSchedule(params.row.id)}
        />,
      ],
    },
  ];

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
