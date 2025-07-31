import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import { type ReactNode } from "react";

type SettingsCardProps = {
  title: string;
  description: string;
  navigateTo: string;
  icon: ReactNode;
};

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  navigateTo,
  icon,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(navigateTo);
  };

  return (
    <Card>
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Box display="flex" alignItems="center">
            {icon}
            <Box ml={2}>
              <Typography variant="h5" component="div">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
