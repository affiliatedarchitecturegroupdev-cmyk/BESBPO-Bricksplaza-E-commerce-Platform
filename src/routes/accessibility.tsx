import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";

export const Route = createFileRoute("/accessibility")({ component: A11y });

function A11y() {
  return (
    <>
      <PageHeader kicker="WCAG 2.1 AA target" title="Accessibility statement" />
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-mortar sm:px-6">
        <p>
          Bricksplaza aims to meet WCAG 2.1 AA on the storefront: text alternatives on product photography, visible focus, 44px targets on primary actions, and captions not relied upon as the only colour cue (SKU and finish names sit next to swatches).
        </p>
        <p>
          Known gaps at this HITL build: some data tables on the Business Desk are dense; we will add row headers before launch hardening (Phase 5).
        </p>
        <p>
          Report barriers to {`sales.bricksplaza@besbpo.co.za`} with “Accessibility” in the subject.
        </p>
      </article>
    </>
  );
}
