import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout only. The full catalogue lives on /shop (index). A category lives on /shop/$slug. */
export const Route = createFileRoute("/shop")({
  component: () => <Outlet />,
});
