import { type ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type EntityCardProps = {
  title: string;
  /** Small element rendered next to the title, e.g. a status chip. */
  badge?: ReactNode;
  /** Detail lines rendered under the title. */
  children?: ReactNode;
  /** Row of action buttons rendered at the bottom, outside the tap target. */
  actions?: ReactNode;
  /** Makes the card content a tap target (used to open the record). */
  onClick?: () => void;
};

/**
 * Card representing one record in a mobile list. When `onClick` is set the
 * content area becomes a single large tap target while `actions` stay
 * separately clickable below it.
 */
export const EntityCard = ({ title, badge, children, actions, onClick }: EntityCardProps) => {
  const content = (
    <CardContent sx={{ pb: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: children ? 1 : 0 }}
      >
        <Typography variant="h6" component="div" sx={{ wordBreak: "break-word" }}>
          {title}
        </Typography>
        {badge}
      </Stack>
      {children}
    </CardContent>
  );

  return (
    <Card variant="outlined">
      {onClick ? (
        <CardActionArea onClick={onClick} aria-label={title}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
      {actions && <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>{actions}</CardActions>}
    </Card>
  );
};
