import React from "react";
import type { ReactQueryDevtools as TanstackReactQueryDevtools } from "@tanstack/react-query-devtools";

export const ReactQueryDevtools:
  | React.LazyExoticComponent<typeof TanstackReactQueryDevtools>
  | (() => null) = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import("@tanstack/react-query-devtools").then((res) => ({
        default: () => (
          <res.ReactQueryDevtools initialIsOpen={false} buttonPosition={"bottom-left"} />
        ),
      })),
    );
