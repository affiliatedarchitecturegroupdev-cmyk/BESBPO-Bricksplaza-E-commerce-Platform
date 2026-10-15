import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";

type Turn = { from: "yard" | "you"; text: string };

const REPLIES: { test: RegExp; answer: string }[] = [
  {
    test: /scode|shoprite|checkers|in-store|in store|barcode/i,
    answer:
      "SCode is a Payfast method. It is meant to let a buyer pay at more than 6,000 outlets, including Shoprite, Checkers, Checkers Hyper, Shoprite Usave, House & Home, OK Furniture and the South African Post Office. Payfast sends a barcoded email or an SMS, and the cashier takes cash, debit or credit. It is not connected here, so checkout only records the choice.",
  },
  {
    test: /pay|card|eft|ozow|payfast|trade account|bnpl/i,
    answer:
      "Twenty methods are listed, including SCode. None of the card gateways capture money yet. EFT waits on a reference the yard matches. An approved trade account draws on its limit. Everything else is saved as simulated.",
  },
  {
    test: /trade|volume|12%|20%|discount/i,
    answer:
      "Retail is list. An approved trade account is 12% off. Volume is 20% off. Net 7, 14 or 30 is set by the yard after credit vetting. Apply under Account, once you are signed in.",
  },
  {
    test: /deliver|pin|fee|freight|midrand|cato|collect/i,
    answer:
      "Set a pin and the fee follows the nearer of Midrand and Cato Ridge: local to 30 km, regional to 100 km, extended to 250 km, and a quote after that. Collection is free from the nearer yard. The other seven provinces are quoted long haul. Those two pins are town centres, not surveyed street addresses.",
  },
  {
    test: /aa 60|express|120|60 minute/i,
    answer:
      "AA 60/120 is R1 000 on top of a quoted delivery, for stocked lines only, when a supplier pin is within 30 km. Monday to Saturday, 07:00 to 15:30. Made-to-order lines stay on the ordinary lead time. Collection does not qualify.",
  },
  {
    test: /handling|return|18%/i,
    answer:
      "The handling fee is 18% of the paid order when you change or return materials for a reason that is not ours and not the supplier’s. Damage, a shortage, or a supplier fault is not charged. Cards are not charged. The amount is recorded on the return.",
  },
  {
    test: /brand|corobrik|bosun|technicrete|infraset|quote-only|manufacturer/i,
    answer:
      "Corobrik, Bosun, Technicrete and Infraset each have a quote-only shop. Those ranges are named beside the priced catalogue. They are not sold off a shelf price.",
  },
  {
    test: /build|affiliated|finish|plaster|bae|architect|engineer|service/i,
    answer:
      "Bricksplaza prices the material, the pin, crane offload and a coverage schedule. Affiliated Builders builds. Finishes Construction finishes. Bellwether Architecture & Engineering takes a design or engineering question. There is no installer directory and no plan-reading bill of quantities.",
  },
  {
    test: /aac|cseb|agr[eé]ment|sans/i,
    answer:
      "Clay facing, semi-face, maxi, stock and specials are sold against SANS 227. Pavers against SANS 1058. Concrete blocks against SANS 1215. AAC and CSEB carry Agrément on the listing. The certificate is the manufacturer’s, printed on the product, not a Bricksplaza stamp.",
  },
  {
    test: /coverage|square|m2|m²|how many/i,
    answer:
      "Coverage is on the product page: 1000 divided by length, times 1000 divided by width, using that SKU’s size. Add about 5% on a rectangle and about 8% on herringbone. It is a schedule, not a bill of quantities.",
  },
  {
    test: /price|cost|how much|r\d/i,
    answer:
      "I will not invent a price. Open the product for retail, trade and volume, or search the SKU. A manufacturer shop is quote-only. A bulk load that is bigger than the cart should go through Request a quote.",
  },
  {
    test: /hour|open|phone|whatsapp|contact|human|person/i,
    answer:
      "The yard desk is weekdays 07:00–16:30 SAST. Sales is sales.bricksplaza@besbpo.co.za and WhatsApp +27 68 367 6276. This panel answers from the catalogue. It does not place an order.",
  },
];

function pageLine(path: string) {
  if (path.startsWith("/product/")) return "You are on a product. I can talk about that unit, a colour match, or the pin.";
  if (path.startsWith("/shop/")) return "You are in a category. Search a colour or a duty if the list is too wide.";
  if (path.startsWith("/cart")) return "You are in the cart. Nothing is charged until a connected method exists.";
  if (path.startsWith("/checkout")) return "You are at checkout. Choosing a method records it. It does not take money, except a trade draw or an EFT you pay yourself.";
  if (path.startsWith("/search")) return "You are in search. Try a SKU, a colourway, or words like driveway, braai, AAC or SANS 227.";
  if (path.startsWith("/trade")) return "You are on trade. 12% once the account is approved. Volume is 20%.";
  if (path.startsWith("/brands")) return "You are in the manufacturer shops. Those ranges are quoted, not shelf-priced.";
  if (path.startsWith("/services") || path.startsWith("/divisions") || path.startsWith("/bae"))
    return "You are on the group services. Material stays with Bricksplaza. The build, the finish and the design are separate contracts.";
  if (path.startsWith("/ways-to-pay")) return "You are on ways to pay. SCode is the in-store option. It is not live yet.";
  if (path.startsWith("/delivery")) return "You are on delivery. The fee follows the pin, not a flat national rate.";
  return "Ask about a SKU, a colour, delivery, trade, SCode or who builds the wall.";
}

function replyTo(text: string, path: string) {
  const hit = REPLIES.find((row) => row.test.test(text));
  if (hit) return hit.answer;
  if (path.startsWith("/product/")) {
    return "On a product page the price, the standard and the coverage calculator are on the page itself. I will not quote a different number. If the load is bulk, use Request a quote.";
  }
  return "I can help with delivery pins, trade at 12% and volume at 20%, SCode, quote-only brands, and the split between Bricksplaza, Affiliated Builders and Finishes Construction. Name a SKU or a category if you want a product.";
}

export function YardChat() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const intro = useMemo(() => pageLine(path), [path]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  function ask(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setTurns((prev) => {
      const next: Turn[] = [
        ...prev,
        { from: "you", text: clean },
        { from: "yard", text: replyTo(clean, path) },
      ];
      return next.slice(-12);
    });
    setDraft("");
  }

  return (
    <div className="fixed bottom-4 right-3 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end sm:bottom-5 sm:right-5">
      {open && (
        <div className="mb-3 flex max-h-[min(70vh,32rem)] w-full max-w-[22rem] flex-col overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card-hover)]">
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-lg leading-tight">Yard desk</p>
              <p className="text-xs text-muted">Shop assistant · weekdays 07:00–16:30 SAST</p>
            </div>
            <button type="button" className="inline-flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-card" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            <p className="rounded-md bg-card px-3 py-2 text-sm leading-snug text-mortar">{intro}</p>
            {turns.map((turn, i) => (
              <p key={i} className={`rounded-md px-3 py-2 text-sm leading-snug ${turn.from === "you" ? "bg-kiln text-bisque" : "bg-card text-kiln"}`}>
                {turn.text}
              </p>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-line px-3 py-2">
            {["Delivery pin", "Trade 12%", "SCode", "Who builds?"].map((chip) => (
              <button key={chip} type="button" className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs" onClick={() => ask(chip)}>
                {chip}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="SKU, delivery, SCode…"
              className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm"
            />
            <button className="h-11 shrink-0 rounded-md bg-clay px-3 text-sm font-medium text-paper">Ask</button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-clay px-4 font-medium text-paper shadow-[var(--shadow-card-hover)]"
        aria-expanded={open}
      >
        <MessageCircle className="size-4" /> {open ? "Hide chat" : "Live chat"}
      </button>
    </div>
  );
}