import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn, authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({ email, password, name });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message);
      }
      window.location.href = "/account";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-kiln lg:block">
        <img src="/images/hero/yard.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-kiln via-kiln/40 to-kiln/20" />
        <div className="relative flex h-full flex-col justify-between p-10 text-bisque">
          <img src="/brand/lockup_reversed.svg" alt="Bricksplaza" className="h-10 w-auto" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Trade & retail</p>
            <h1 className="mt-3 font-display text-4xl">One catalogue. Three tiers. Yards in GP and KZN.</h1>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <img src="/brand/lockup_light.svg" alt="Bricksplaza" className="h-10" />
          </Link>
          <h1 className="font-display text-3xl">{mode === "in" ? "Sign in" : "Create an account"}</h1>
          <p className="mt-2 text-sm text-mortar">
            Google, X, or email. Email verification is required before the first paid checkout on a new email account.
          </p>
          {authEnabled ? (
            <div className="mt-6 space-y-3">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/account" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
              <div className="flex items-center gap-3 py-2 text-xs uppercase tracking-[0.16em] text-muted">
                <span className="h-px flex-1 bg-line" />
                or email
                <span className="h-px flex-1 bg-line" />
              </div>
              <form className="space-y-3" onSubmit={onEmail}>
                {mode === "up" && (
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                {error && <p className="text-sm text-clay">{error}</p>}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
                </Button>
              </form>
              <button
                type="button"
                className="w-full text-sm text-mortar hover:text-clay"
                onClick={() => setMode(mode === "in" ? "up" : "in")}
              >
                {mode === "in" ? "Need an account? Create one" : "Already registered? Sign in"}
              </button>
              <Link to="/forgot-password" className="block text-center text-sm text-mortar hover:text-clay">
                Forgot password
              </Link>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
