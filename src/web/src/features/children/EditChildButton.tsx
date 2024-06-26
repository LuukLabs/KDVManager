import IconButton from "@mui/material/IconButton/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

type EditChildButtonProps = {
  id: string;
};

export const EditChildButton: React.FC<EditChildButtonProps> = ({ id }) => {
  const navigate = useNavigate();

  const handleOnEditClick = () => {
    navigate(`/children/${id}`);
  };

  return (
    <IconButton aria-label="edit" onClick={handleOnEditClick}>
      <EditIcon />
    </IconButton>
  );
};
