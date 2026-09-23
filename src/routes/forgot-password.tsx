import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center">
          <img src="/brand/lockup_light.svg" alt="Bricksplaza" className="h-10" />
        </Link>
        <h1 className="font-display text-3xl">Reset password</h1>
        <p className="mt-2 text-sm text-mortar">Time-limited link, rate-limited to prevent enumeration.</p>
        {sent ? (
          <p className="mt-6 text-sm">If an account exists for that email, a reset message is on its way.</p>
        ) : (
          <form
            className="mt-6 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              const email = String(new FormData(e.currentTarget).get("email"));
              try {
                const client = authClient as unknown as {
                  forgetPassword?: (d: { email: string; redirectTo: string }) => Promise<{ error?: { message: string } }>;
                  requestPasswordReset?: (d: { email: string; redirectTo: string }) => Promise<{ error?: { message: string } }>;
                };
                const fn = client.requestPasswordReset ?? client.forgetPassword;
                if (fn) {
                  const res = await fn({ email, redirectTo: "/login" });
                  if (res?.error) throw new Error(res.error.message);
                }
                setSent(true);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not send reset");
              }
            }}
          >
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" required />
            </div>
            {error && <p className="text-sm text-clay">{error}</p>}
            <Button type="submit" className="w-full">
              Send reset
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
