import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/warranty")({ component: Warranty });

function Warranty() {
  const [done, setDone] = useState(false);
  return (
    <>
      <PageHeader kicker="Support" title="Warranty claim" body="Manufacturing conformity to the stated SANS / Agrément spec. Site workmanship is excluded." />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        {done ? (
          <p className="rounded-xl bg-card p-6">Claim received. Supply desk will match it to the delivery note.</p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <div>
              <Label>Order or delivery note</Label>
              <Input required name="ref" />
            </div>
            <div>
              <Label>SKU</Label>
              <Input name="sku" />
            </div>
            <div>
              <Label>Describe the non-conformance</Label>
              <Textarea required name="body" />
            </div>
            <Button type="submit">Lodge claim</Button>
          </form>
        )}
      </div>
    </>
  );
}
