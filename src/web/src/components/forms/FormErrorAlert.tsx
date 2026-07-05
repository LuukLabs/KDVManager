import Alert from "@mui/material/Alert";
import { type SxProps, type Theme } from "@mui/material/styles";

type FormErrorAlertProps = {
  message: string | null;
  onClose?: () => void;
  sx?: SxProps<Theme>;
};

/** Dismissible submit-error alert; renders nothing while there is no error. */
export const FormErrorAlert = ({ message, onClose, sx }: FormErrorAlertProps) => {
  if (!message) return null;
  return (
    <Alert severity="error" onClose={onClose} sx={sx}>
      {message}
    </Alert>
  );
};
