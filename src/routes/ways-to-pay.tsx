import { createFileRoute, Link } from "@tanstack/react-router";
import { PAYMENT_METHODS } from "@/data/content";
import { PageHeader } from "@/components/layout";

export const Route = createFileRoute("/ways-to-pay")({ component: WaysToPay });

function WaysToPay() {
  return (
    <>
      <PageHeader
        kicker="Ways to pay"
        title="Eighteen ways. None of the gateways are live yet."
        body="The list is the one Bricksplaza will take. A logo means we have the official mark. No logo means the artwork is still coming. Selecting a method at checkout records the choice. It does not take money, except a trade account drawing on an approved limit, or an EFT you pay yourself."
      />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-2">
        {PAYMENT_METHODS.map((method) => (
          <article key={method.id} className="rounded-xl border border-line bg-paper p-5">
            <div className="flex min-h-10 items-center">
              {method.logo ? (
                <img src={method.logo} alt="" className="h-8 w-auto max-w-[9rem] object-contain object-left" />
              ) : (
                <p className="font-display text-xl">{method.name}</p>
              )}
            </div>
            <h2 className="mt-3 font-display text-2xl">{method.name}</h2>
            <p className="text-xs uppercase tracking-[0.14em] text-clay">{method.kind}</p>
            <p className="mt-3 text-sm text-mortar">{method.summary}</p>
            <p className="mt-2 text-sm">{method.terms}</p>
          </article>
        ))}
      </div>
      <p className="mx-auto max-w-7xl px-4 pb-12 text-sm text-mortar sm:px-6">
        Visa, Mastercard, PayPal, Mukuru and the other marks in the logo pack are not checkout methods here.{" "}
        <Link to="/checkout" className="text-clay">
          Go to checkout
        </Link>
      </p>
    </>
  );
}
