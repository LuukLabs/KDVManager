import { type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

type EntityLinkProps = {
  to: string;
  children: ReactNode;
};

/**
 * Link to a record's detail page, used for the primary (name) column of
 * tables. A real anchor keeps native link behaviour: open in a new tab,
 * copy link address, and screen-reader link semantics.
 */
export const EntityLink = ({ to, children }: EntityLinkProps) => (
  <Link component={RouterLink} to={to} underline="hover">
    {children}
  </Link>
);
