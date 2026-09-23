import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { submitRfq } from "@/lib/commerce";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { PROVINCES } from "@/data/taxonomy";
import { useState } from "react";
import { toast } from "sonner";

type Search = { sku?: string };

export const Route = createFileRoute("/rfq")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    sku: typeof s.sku === "string" ? s.sku : undefined,
  }),
  component: Rfq,
});

function Rfq() {
  const { sku } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [done, setDone] = useState(false);
  if (isPending) return <div className="h-32 animate-pulse bg-card" />;
  if (!user) return <RedirectToSignIn />;
  return (
    <>
      <PageHeader
        kicker="Civil & industrial"
        title="Bulk quote / RFQ"
        body="For packages that should not go through the 5-step checkout — volume masonry, estate rolls, municipal paving."
      />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        {done ? (
          <p className="rounded-xl bg-card p-6">RFQ opened. A estimator will reply from the sales desk.</p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await submitRfq({
                data: {
                  name: String(fd.get("name")),
                  email: String(fd.get("email")),
                  company: String(fd.get("company")),
                  phone: String(fd.get("phone")),
                  province: String(fd.get("province")),
                  message: String(fd.get("message")),
                  sku_list: String(fd.get("sku_list")),
                },
              });
              toast.success("RFQ submitted");
              setDone(true);
            }}
          >
            <div>
              <Label>Name</Label>
              <Input name="name" required defaultValue={user.displayName ?? ""} />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" required defaultValue={user.primaryEmail ?? ""} />
            </div>
            <div>
              <Label>Company</Label>
              <Input name="company" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" />
            </div>
            <div>
              <Label>Province</Label>
              <Select name="province" defaultValue="Gauteng">
                {PROVINCES.map((p) => (
                  <option key={p.slug}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>SKUs</Label>
              <Input name="sku_list" defaultValue={sku ?? ""} />
            </div>
            <div>
              <Label>Scope</Label>
              <Textarea name="message" required placeholder="Quantities, programme, offload constraints…" />
            </div>
            <Button type="submit">Send RFQ</Button>
          </form>
        )}
      </div>
    </>
  );
}
