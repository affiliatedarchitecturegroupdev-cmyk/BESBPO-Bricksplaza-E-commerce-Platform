import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadInvoice } from "@/lib/commerce";
import { collectionSlotLabel } from "@/lib/delivery";
import { CONTACTS } from "@/data/content";
import { formatZar } from "@/lib/format";

export const Route = createFileRoute("/invoice/$id")({ component: InvoicePage });

type Invoice = NonNullable<Awaited<ReturnType<typeof loadInvoice>>>;

function InvoicePage() {
  const { id } = Route.useParams();
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);

  useEffect(() => {
    let cancel = false;
    loadInvoice({ data: id })
      .then((row) => {
        if (!cancel) setInvoice(row);
      })
      .catch(() => {
        if (!cancel) setInvoice(null);
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  if (invoice === undefined) return <p className="p-10 text-sm">Loading invoice…</p>;
  if (!invoice) return <p className="p-10">Invoice not found.</p>;

  const when = new Date(invoice.created_at);
  const dated = Number.isNaN(when.getTime()) ? invoice.created_at : when.toLocaleDateString("en-ZA");
  const slot = collectionSlotLabel(invoice.collection_slot);

  return (
    <div className="mx-auto max-w-3xl bg-paper px-6 py-10 text-kiln print:max-w-none">
      <div className="flex items-start justify-between gap-6">
        <div>
          <img src="/brand/lockup_light.svg" alt="Bricksplaza" className="h-10" />
          <p className="mt-3 text-sm">A division of Besbpo Group</p>
          <p className="text-sm text-mortar">{CONTACTS.sales}</p>
          <p className="text-sm text-mortar">
            {invoice.vat_number ? `VAT ${invoice.vat_number}` : "VAT number not yet supplied"}
          </p>
        </div>
        <div className="text-right">
          <h1 className="font-display text-3xl">Tax invoice</h1>
          <p className="mt-1 text-sm">{invoice.id}</p>
          <p className="text-sm text-mortar">{dated}</p>
          <p className="text-sm capitalize text-mortar">{invoice.payment_status.replaceAll("_", " ")}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Bill to</p>
          <p className="mt-1 font-medium">{invoice.address.recipient || "Customer"}</p>
          <p>{invoice.address.line1}</p>
          <p>
            {invoice.address.city}
            {invoice.address.province ? `, ${invoice.address.province}` : ""} {invoice.address.postal_code}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Fulfilment</p>
          <p className="mt-1 capitalize">{invoice.delivery_method}</p>
          {slot && <p>{slot}</p>}
          <p className="capitalize">Price tier: {invoice.tier}</p>
          {invoice.payment_reference && <p>EFT reference: {invoice.payment_reference}</p>}
        </div>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead className="text-left text-[11px] uppercase tracking-wider text-muted">
          <tr>
            <th className="py-2">Item</th>
            <th>Qty</th>
            <th>Unit excl. VAT</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.sku} className="border-t border-line">
              <td className="py-2">
                {line.name}
                <span className="mt-0.5 block font-mono text-xs text-muted">{line.sku}</span>
              </td>
              <td>{line.qty}</td>
              <td className="tabular-nums">{formatZar(line.unit_price)}</td>
              <td className="text-right tabular-nums">{formatZar(line.unit_price * line.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-6 w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>Goods excl. VAT</dt>
          <dd className="tabular-nums">{formatZar(invoice.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery excl. VAT</dt>
          <dd className="tabular-nums">{formatZar(invoice.delivery_fee)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>VAT 15%</dt>
          <dd className="tabular-nums">{formatZar(invoice.vat)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 font-display text-xl">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatZar(invoice.total)}</dd>
        </div>
      </dl>

      <p className="mt-8 text-xs text-mortar">
        Prices are exclusive of VAT at line level. The total includes VAT at 15%. This document is not a card receipt.
        Payment status “simulated” means no merchant has captured funds.
      </p>
      <div className="mt-6 flex gap-4 print:hidden">
        <button type="button" className="text-sm font-medium text-clay" onClick={() => window.print()}>
          Print
        </button>
        <Link to="/order/$id" params={{ id: invoice.id }} className="text-sm text-mortar">
          Back to the order
        </Link>
      </div>
    </div>
  );
}
