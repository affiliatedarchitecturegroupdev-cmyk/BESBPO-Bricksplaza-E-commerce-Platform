import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/track")({ component: Track });

function Track() {
  const [id, setId] = useState("");
  return (
    <>
      <PageHeader kicker="Support" title="Track my order" body="Public tracking — no account required if you have the order id." />
      <form
        className="mx-auto flex max-w-lg gap-2 px-4 py-10 sm:px-6"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="BP-… or GUEST-…" />
        {id ? (
          <Link to="/order/$id" params={{ id }}>
            <Button type="button">Track</Button>
          </Link>
        ) : (
          <Button type="submit" disabled>
            Track
          </Button>
        )}
      </form>
    </>
  );
}
