import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { claimYard, deskOrders, setShipment } from "@/lib/commerce";
import { CARRIERS } from "@/lib/delivery";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/logistics")({ component: Logistics });

function Logistics() {
  const [data, setData] = useState<Awaited<ReturnType<typeof deskOrders>> | null>(null);
  const [carrier, setCarrier] = useState<Record<string, string>>({});
  const [ref, setRef] = useState<Record<string, string>>({});

  async function refresh() {
    const next = await deskOrders();
    setData(next);
    const carriers: Record<string, string> = {};
    const refs: Record<string, string> = {};
    for (const order of next.orders) {
      carriers[order.id] = order.carrier && CARRIERS.includes(order.carrier as (typeof CARRIERS)[number]) ? order.carrier : "DSV South Africa";
      refs[order.id] = order.tracking_ref && !order.tracking_ref.startsWith("TRK-") ? order.tracking_ref : "";
    }
    setCarrier(carriers);
    setRef(refs);
  }

  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);

  const open = (data?.orders ?? []).filter((order) => order.status !== "delivered" && order.status !== "cancelled");

  return (
    <div>
      <h1 className="font-display text-3xl">Logistics</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Record the carrier and the reference they gave you. Nothing here calls DSV, Faber or Panamax. A blank reference means the load is not booked.
      </p>
      {data && !data.yard && (
        <div className="mt-4">
          <Button
            onClick={async () => {
              await claimYard();
              toast.success("Yard claimed");
              refresh();
            }}
          >
            Claim the yard
          </Button>
        </div>
      )}
      <div className="mt-6 space-y-3">
        {open.map((order) => (
          <form
            key={order.id}
            className="grid gap-2 rounded-xl bg-kiln-2 p-4 md:grid-cols-[10rem_1fr_1fr_auto] md:items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await setShipment({
                  data: { id: order.id, carrier: carrier[order.id] ?? "", tracking_ref: ref[order.id] ?? "" },
                });
                toast.success("Shipment recorded");
                refresh();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not save");
              }
            }}
          >
            <div>
              <p className="font-mono text-xs">{order.id}</p>
              <p className="text-xs capitalize text-dim">{order.status.replaceAll("_", " ")}</p>
            </div>
            <Select
              className="bg-kiln text-bisque"
              value={carrier[order.id] ?? "DSV South Africa"}
              onChange={(e) => setCarrier({ ...carrier, [order.id]: e.target.value })}
              disabled={!data?.yard}
            >
              {CARRIERS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </Select>
            <Input
              value={ref[order.id] ?? ""}
              placeholder="Carrier reference"
              onChange={(e) => setRef({ ...ref, [order.id]: e.target.value })}
              disabled={!data?.yard}
            />
            <Button type="submit" disabled={!data?.yard}>
              Save
            </Button>
          </form>
        ))}
        {open.length === 0 && <p className="text-sm text-dim">No open loads.</p>}
      </div>
    </div>
  );
}
