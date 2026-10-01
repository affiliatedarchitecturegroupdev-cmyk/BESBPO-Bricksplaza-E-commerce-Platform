import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { VACANCIES } from "@/data/content";
import { PageHeader } from "@/components/layout";
import { submitEnquiry } from "@/lib/commerce";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/careers")({ component: Careers });

function Careers() {
  const [sent, setSent] = useState(false);
  const role = VACANCIES[0];
  return (
    <>
      <PageHeader
        kicker="Careers"
        title="One open role"
        body="Apply only for a role listed here. A closed list means there is nothing to apply for. The yard reads applications; this form does not hire you."
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <article>
          <p className="text-[11px] uppercase tracking-[0.16em] text-clay">{role.where}</p>
          <h2 className="mt-2 font-display text-3xl">{role.title}</h2>
          <p className="mt-3 text-mortar">{role.body}</p>
        </article>
        <form
          className="rounded-xl bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            try {
              await submitEnquiry({
                data: {
                  kind: "career",
                  role: role.title,
                  name: String(form.get("name") ?? ""),
                  email: String(form.get("email") ?? ""),
                  phone: String(form.get("phone") ?? ""),
                  message: String(form.get("message") ?? ""),
                },
              });
              setSent(true);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not send");
            }
          }}
        >
          {sent ? (
            <p className="text-sm">Application received. The yard will write back if they want to talk.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input name="name" required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" />
              </div>
              <div>
                <Label>Why this role</Label>
                <Textarea name="message" required />
              </div>
              <Button type="submit">Apply for Sales</Button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
