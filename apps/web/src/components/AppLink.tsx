import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigateTo } from "../lib/navigation";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};

export function AppLink({ to, onClick, ...props }: AppLinkProps) {
  function openRoute(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateTo(to);
  }

  return <a href={to} onClick={openRoute} {...props} />;
}
