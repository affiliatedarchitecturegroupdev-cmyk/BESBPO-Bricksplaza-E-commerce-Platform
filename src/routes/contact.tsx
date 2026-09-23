import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { CONTACTS } from "@/data/content";
import { PROVINCES } from "@/data/taxonomy";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHeader kicker="Support" title="Contact us" body="Sales, supply desk and group partnerships." />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div className="space-y-3 text-sm">
          <p>
            <span className="text-muted">Sales</span>
            <br />
            {CONTACTS.sales}
          </p>
          <p>
            <span className="text-muted">Supply</span>
            <br />
            {CONTACTS.supply}
          </p>
          <p>
            <span className="text-muted">Partnerships</span>
            <br />
            {CONTACTS.partners}
          </p>
          <ul className="mt-6 space-y-1 text-mortar">
            {PROVINCES.filter((p) => p.yard).map((p) => (
              <li key={p.slug}>
                {p.yard} · {p.name}
              </li>
            ))}
          </ul>
        </div>
        {sent ? (
          <p className="rounded-xl bg-card p-6">Message received. We’ll reply from the sales desk.</p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div>
              <Label>Name</Label>
              <Input required name="name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" name="email" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea required name="message" />
            </div>
            <Button type="submit">Send</Button>
          </form>
        )}
      </div>
    </>
  );
}
