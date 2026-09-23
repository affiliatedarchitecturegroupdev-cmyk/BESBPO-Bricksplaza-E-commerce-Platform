import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/desk")({ component: DeskLayout });

function DeskLayout() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="h-40 animate-pulse rounded-xl bg-kiln-2" />;
  if (!user) return <RedirectToSignIn />;
  return <Outlet />;
}
