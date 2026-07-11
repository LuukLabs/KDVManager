import { useLayoutEffect } from "react";

type ScrollToTopProps = {
  resetKey: string;
};

/** Resets the document scroll position when the displayed entity changes. */
export const ScrollToTop = ({ resetKey }: ScrollToTopProps) => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [resetKey]);

  return null;
};
