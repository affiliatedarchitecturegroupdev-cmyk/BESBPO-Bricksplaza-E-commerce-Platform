export type HeroSlide = {
  key: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
  /** object-position so a portrait photo still shows the product when cropped. */
  focus: string;
  credit: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    key: "face-house",
    kicker: "Residential face brick",
    title: "A house that is the brick, not a coat of paint.",
    body: "Satin, rustic, wirecut and sandstock face bricks in 14 colourways — Autumn Red through White — for freestanding homes and estates.",
    cta: "Shop face bricks",
    href: "/shop/clay-face-bricks",
    image: "/images/hero/slides/face-house.jpg",
    alt: "Two-storey red face-brick house with arched windows under a clear sky",
    focus: "center",
    credit: "DavidM4008, Wikimedia Commons, CC BY-SA 4.0",
  },
  {
    key: "facade-cobbles",
    kicker: "Face brick and cobbles",
    title: "Clay on the wall. Cobbles at the door.",
    body: "Specify the elevation and the approach together. Face brick for the wall, cobbles for the forecourt, ordered from one catalogue.",
    cta: "Shop cobbles",
    href: "/shop/cobbles",
    image: "/images/hero/slides/facade-cobbles.jpg",
    alt: "Red brick facade with an arched doorway and a cobbled forecourt",
    focus: "center",
    credit: "Wikimedia Commons",
  },
  {
    key: "commercial",
    kicker: "Commercial",
    title: "Dark face brick that still reads from the street.",
    body: "Commercial and mixed-use elevations in deep colourways. Engineering brick and an RFQ when the package is bigger than a house.",
    cta: "Shop commercial",
    href: "/sectors/commercial",
    image: "/images/hero/slides/commercial-dark.jpg",
    alt: "Contemporary dark brick commercial building against a clear blue sky",
    focus: "center",
    credit: "Unsplash",
  },
  {
    key: "specials",
    kicker: "Clay specials",
    title: "Quoins, string courses, chimneys and sills.",
    body: "The brick that draws the lines. Specials for the parts a standard stretcher cannot do, matched to the facing colourway.",
    cta: "Shop clay specials",
    href: "/shop/clay-specials",
    image: "/images/hero/slides/brick-courses.jpg",
    alt: "House with brick quoins, horizontal brick courses and a brick chimney",
    focus: "center",
    credit: "Unsplash",
  },
  {
    key: "volume",
    kicker: "Trade and volume",
    title: "The same brick, on every floor.",
    body: "A multi-storey elevation is a volume order, not a sample. Trade is 12% off retail. Volume is 20%. Net-30 for approved accounts.",
    cta: "See trade pricing",
    href: "/trade",
    image: "/images/hero/slides/apartment-grid.jpg",
    alt: "Brown brick apartment facade with a regular grid of windows",
    focus: "center",
    credit: "Wilfredor, Wikimedia Commons, CC BY-SA 4.0",
  },
  {
    key: "pavers",
    kicker: "Clay pavers",
    title: "Herringbone clay, made to take a drive.",
    body: "Clay and concrete pavers from pedestrian through extra heavy-duty. Every product page has a coverage calculator for the square metres.",
    cta: "Shop clay pavers",
    href: "/shop/clay-pavers",
    image: "/images/hero/slides/paver-herringbone.jpg",
    alt: "Close view of red clay pavers laid in a herringbone bond",
    focus: "center",
    credit: "Sisters.seamless, Wikimedia Commons, CC0",
  },
  {
    key: "garden",
    kicker: "Garden walls",
    title: "A boundary wall, and a coping that sheds the rain.",
    body: "Stock or face brick for the wall. Once-weathered coping in the same colourway, so the top course is not an afterthought.",
    cta: "Shop coping",
    href: "/shop/coping",
    image: "/images/hero/slides/garden-wall.jpg",
    alt: "Weathered brick garden wall with a coping course and flowering plants",
    focus: "center 42%",
    credit: "Acabashi, Wikimedia Commons, CC BY-SA 4.0",
  },
  {
    key: "braai",
    kicker: "Braai kits",
    title: "A brick braai, scheduled as a kit.",
    body: "Single braai kits with the brick count, grate and flue, plus firebrick for the firebox. Add Class II mortar and build it over a weekend.",
    cta: "Shop braai kits",
    href: "/shop/braai-kits",
    image: "/images/hero/slides/braai.jpg",
    alt: "Red brick outdoor braai with a chimney, metal grate and concrete shelves",
    focus: "center 32%",
    credit: "Wikimedia Commons, CC BY-SA 4.0",
  },
  {
    key: "delivery",
    kicker: "Yards and freight",
    title: "Off the truck and onto the stand.",
    body: "Same-day collection at the Midrand and Cato Ridge yards. Palletised freight for the other seven provinces.",
    cta: "Gauteng yard",
    href: "/locations/gauteng",
    image: "/images/hero/slides/delivery.jpg",
    alt: "Bricks being unloaded from a truck onto a building site",
    focus: "center",
    credit: "VilhoRoyal995, Wikimedia Commons, CC BY-SA 4.0",
  },
  {
    key: "mortar",
    kicker: "Mortar and sundries",
    title: "The wall is only as honest as the bed under it.",
    body: "Class II masonry mortar, jointing sand and paver sealer — the lines that hold facework and a patio together.",
    cta: "Shop mortar and sand",
    href: "/shop/mortar-accessories",
    image: "/images/hero/slides/mortar-bed.jpg",
    alt: "Masons floating a fresh concrete bed with a trowel on site",
    focus: "center",
    credit: "Pexels",
  },
  {
    key: "blocks",
    kicker: "Concrete masonry",
    title: "Pale block, and a boundary that finishes the stand.",
    body: "Concrete blocks, maxi units and retaining for the structure and the street edge — when the elevation wants light masonry, not red clay.",
    cta: "Shop concrete blocks",
    href: "/shop/concrete-blocks",
    image: "/images/hero/slides/light-masonry.jpg",
    alt: "Contemporary house in pale masonry with a low boundary wall",
    focus: "center",
    credit: "Unsplash",
  },
  {
    key: "slips",
    kicker: "Brick slips",
    title: "The clay face, without rebuilding the wall.",
    body: "Where render has failed — or a light-steel frame cannot take a full brick skin — slips give you the kiln face at a fraction of the weight.",
    cta: "Shop brick slips",
    href: "/shop/brick-slips",
    image: "/images/hero/slides/under-render.jpg",
    alt: "Red bricks showing through cracked and peeling grey render",
    focus: "center",
    credit: "Wikimedia Commons",
  },
];


export type BundleLine = {
  categorySlug: string;
  productType: string;
  colour?: string;
  qty: number;
};

export type BundleDef = {
  slug: string;
  name: string;
  blurb: string;
  href: string;
  image: string;
  tag: string;
  lines: BundleLine[];
};

export const BUNDLES: BundleDef[] = [
  {
    slug: "patio-starter",
    name: "Patio Starter Kit",
    blurb: "Clay pavers + jointing sand + sealer, scheduled per a small patio load.",
    href: "/bundles/patio-starter",
    image: "/images/hero/driveway.jpg",
    tag: "Bundle",
    lines: [
      { categorySlug: "clay-pavers", productType: "Clay Paver Smooth", colour: "Sandstone", qty: 100 },
      { categorySlug: "mortar-accessories", productType: "Jointing Sand", colour: "Sandstone", qty: 2 },
      { categorySlug: "mortar-accessories", productType: "Paver Sealer", colour: "Sandstone", qty: 1 },
    ],
  },
  {
    slug: "elevation-pack",
    name: "Elevation Pack",
    blurb: "Face brick + matching semi-face + coping in one colourway.",
    href: "/bundles/elevation-pack",
    image: "/images/hero/facade.jpg",
    tag: "Colour-match",
    lines: [
      { categorySlug: "clay-face-bricks", productType: "Satin Smooth Face Brick", colour: "Autumn Red", qty: 500 },
      { categorySlug: "semi-face-bricks", productType: "Semi-Face Smooth", colour: "Autumn Red", qty: 200 },
      { categorySlug: "coping", productType: "Once-Weathered Coping", colour: "Autumn Red", qty: 20 },
    ],
  },
  {
    slug: "braai-weekend",
    name: "Weekend Braai Kit",
    blurb: "Single braai kit with firebrick and Class II mortar.",
    href: "/bundles/braai-weekend",
    image: "/images/hero/braai.jpg",
    tag: "New",
    lines: [
      { categorySlug: "braai-kits", productType: "Single Braai Kit", colour: "Autumn Red", qty: 1 },
      { categorySlug: "fire-bricks", productType: "Braai Firebrick", colour: "Harvest Gold", qty: 20 },
      { categorySlug: "mortar-accessories", productType: "Class II Masonry Mortar", colour: "Sandstone", qty: 2 },
    ],
  },
  {
    slug: "paving-finishing-kit",
    name: "Paving Finishing Kit",
    blurb: "Jointing sand and paver sealer for the same truck as the pavers.",
    href: "/bundles/paving-finishing-kit",
    image: "/images/projects/patio.jpg",
    tag: "Sundries",
    lines: [
      { categorySlug: "mortar-accessories", productType: "Jointing Sand", colour: "Sandstone", qty: 2 },
      { categorySlug: "mortar-accessories", productType: "Paver Sealer", colour: "Sandstone", qty: 1 },
    ],
  },
];

export const PROJECTS = [
  {
    slug: "midrand-estate",
    title: "Midrand family estate",
    sector: "Residential",
    location: "Gauteng",
    image: "/images/projects/estate.jpg",
    body: "Autumn Red face brick with matching clay paver driveway and once-weathered copings. Colour-matched across the boundary wall.",
    skus: ["BP-CFB-0001", "BP-CPV-0001"],
  },
  {
    slug: "durban-house",
    title: "Umhlanga coastal house",
    sector: "Residential",
    location: "KwaZulu-Natal",
    image: "/images/projects/house.jpg",
    body: "Satin smooth facing in Imperial with semi-face returns. Specified against KZN humidity and salt air.",
    skus: ["BP-CFB-0010"],
  },
  {
    slug: "sandton-driveway",
    title: "Sandton herringbone drive",
    sector: "Residential",
    location: "Gauteng",
    image: "/images/projects/driveway.jpg",
    body: "80 mm extra heavy-duty clay pavers in sandstone/charcoal mix, crane-offloaded into a tight estate.",
    skus: ["BP-CPV-0008"],
  },
  {
    slug: "school-court",
    title: "Institutional courtyard",
    sector: "Institutional",
    location: "Gauteng",
    image: "/images/projects/school.jpg",
    body: "Heavy-duty pavers and face-brick colonnade for a school quad — specified to SANS 1058 and SANS 227.",
    skus: ["BP-CNP-0004"],
  },
  {
    slug: "park-braai",
    title: "Garden braai island",
    sector: "Residential",
    location: "KwaZulu-Natal",
    image: "/images/projects/patio.jpg",
    body: "Island braai kit in Kalahari with matching patio pavers and firebrick hearth.",
    skus: ["BP-BRK-0003"],
  },
  {
    slug: "commercial-plaza",
    title: "Commercial plaza",
    sector: "Commercial",
    location: "Gauteng",
    image: "/images/projects/commercial.jpg",
    body: "Engineering brick plinth, clay face above DPC, concrete pavers to the public square.",
    skus: ["BP-ENB-0001"],
  },
];

export const BLOG = [
  {
    slug: "colour-matching-elevations",
    title: "Why colour-matched masonry still wins the elevation",
    date: "2026-08-12",
    tag: "Specification",
    excerpt:
      "Face, semi-face and paver from one clay body is the Bricksplaza argument. Here is how to write it into a finishing schedule.",
    body: `A house that changes colour between the wall, the garden wall and the driveway reads as three different jobs. Bricksplaza fires face brick, semi-face and clay pavers in the same 14 colourways so a finishing schedule can name one colour — Autumn Red, Imperial, Kalahari — and hold it across every clay surface.

On the product page, the colour-matched strip is not a merchandising widget. It is the same SKU family, same kiln, different unit of sale. Specify the face brick first, then pull the matching semi-face for returns and the matching paver for the drive.

Made-to-order specials (cants, bulls, plinths) pick up the same body. Lead times sit on the PDP before they ever reach a quantity surveyor.`,
  },
  {
    slug: "sans-227-on-site",
    title: "SANS 227 on site: what the stamp actually means",
    date: "2026-07-02",
    tag: "Compliance",
    excerpt: "A short site-office note on clay masonry units, sampling and when to send a brick back.",
    body: `SANS 227 is the South African standard for burnt clay masonry units. Every Bricksplaza clay facing, semi-face, maxi, stock and special is sold against it. Engineering units carry Class A where specified.

On site: keep cubes and bricks dry until laying; do not mix kiln lots on a single elevation without a sample panel; and send non-conforming pallets back with the delivery note, not a WhatsApp photo after they have been opened across three floors.

Agrément certification is separate — it applies to AAC and CSEB in this catalogue, and is printed on those listing cards as well as the PDP.`,
  },
  {
    slug: "trade-account-guide",
    title: "Opening a Bricksplaza trade account",
    date: "2026-06-18",
    tag: "Trade",
    excerpt: "Net 7 / 14 / 30, 12% trade, 20% volume, and how credit vetting actually runs.",
    body: `Retail is list. Trade is 12% off list once the Business Desk has approved the application. Volume is 20% off list for accounts that clear the cumulative-spend threshold.

Float (prepaid) sits on the same ledger: load a balance, draw it down against repeat yard collections. Credit limits are enforced at checkout — the client never gets a say.

Apply from the account page with company, VAT number and typical monthly demand. Large civil packages should still go through RFQ; a trade account is not a substitute for a project quote.`,
  },
  {
    slug: "paver-coverage",
    title: "How many pavers in a square metre?",
    date: "2026-05-21",
    tag: "How-to",
    excerpt: "Use the coverage calculator, then add 5–8% for cuts and the dog-leg at the gate.",
    body: `Coverage is geometry: 1000/length × 1000/width. A 200×100 paver is 50 units per m². The PDP calculator uses the real size of that SKU, not a category average.

Add 5% on a rectangular patio, 8% on herringbone, and more if the drive has a circle or a granite-look fan. Jointing sand and sealer are listed under frequently bought together for every paving SKU.`,
  },
];

export const FAQS = [
  {
    q: "Do you deliver outside Gauteng and KwaZulu-Natal?",
    a: "Yes. GP and KZN have physical yards (Midrand and Cato Ridge). The other seven provinces are online-first: local/regional/extended bands still apply near the yards; 250 km+ is quoted within one business day rather than blocking the order.",
  },
  {
    q: "What is the difference between Retail, Trade and Volume?",
    a: "Retail is list price (0%). Approved trade accounts receive 12% off. Volume accounts receive 20% off. A future Platinum tier is reserved for top cumulative-spend accounts and is not coded at launch.",
  },
  {
    q: "What does Made-to-Order mean on a PDP?",
    a: "The SKU is not sitting on a pallet in the yard. A 15% surcharge is already in the displayed price, and lead time is shown before add-to-cart. Specials (cants, bulls, plinths) are typically MTO.",
  },
  {
    q: "Which payment methods do you take?",
    a: "Fifteen at launch: PayFast, Ozow, SnapScan, Zapper, Yoco, Payflex, PayJustNow, Mobicred, RCS, Peach Payments, Lulapay, EFT, Trade Account / purchase order, Apple Pay and Google Pay. Instant methods confirm immediately; EFT waits on proof of payment; trade accounts draw on approved terms.",
  },
  {
    q: "Can I collect from the yard?",
    a: "Yes — collection is free, same day subject to stock, from the nearest qualifying yard. Crane/Hiab offload is a surcharge on delivery only.",
  },
  {
    q: "How do I open a trade account?",
    a: "Sign in, open Account → Trade, and submit company / VAT / typical monthly demand. The Business Desk credit-vets and assigns a limit and net 7/14/30 terms.",
  },
];

export const PAYMENT_METHODS = [
  { id: "payfast", name: "PayFast", kind: "Card / EFT / wallet" },
  { id: "ozow", name: "Ozow", kind: "Instant EFT" },
  { id: "snapscan", name: "SnapScan", kind: "QR wallet" },
  { id: "zapper", name: "Zapper", kind: "QR wallet" },
  { id: "yoco", name: "Yoco", kind: "Card" },
  { id: "payflex", name: "Payflex", kind: "BNPL · 4 instalments" },
  { id: "payjustnow", name: "PayJustNow", kind: "BNPL · 3 instalments" },
  { id: "mobicred", name: "Mobicred", kind: "Consumer credit" },
  { id: "rcs", name: "RCS", kind: "Store card" },
  { id: "peach", name: "Peach Payments", kind: "Card aggregator" },
  { id: "lulapay", name: "Lulapay", kind: "B2B BNPL" },
  { id: "eft", name: "EFT / Bank transfer", kind: "Proof of payment" },
  { id: "trade", name: "Trade account / PO", kind: "Net 7 / 14 / 30" },
  { id: "applepay", name: "Apple Pay", kind: "Wallet" },
  { id: "googlepay", name: "Google Pay", kind: "Wallet" },
] as const;

export const CARRIERS = [
  { id: "dsv", name: "DSV South Africa", role: "Primary national carrier" },
  { id: "faber", name: "Faber Vervoer", role: "Brick & block specialist · crane offload" },
  { id: "panamax", name: "Panamax Bulk Carriers", role: "Overflow / civil bulk" },
  { id: "besfleet", name: "Besfleet", role: "Group fleet (Gauteng / KZN density)" },
] as const;

export const GROUP = [
  { name: "Besbpo Group", role: "Parent entity" },
  { name: "Affiliated Builders", role: "General construction" },
  { name: "Finishes Construction", role: "Finishing trades" },
  { name: "Roofsteel", role: "Steel & roofing" },
  { name: "Aggregated Aggregates", role: "Sub-base & aggregates" },
  { name: "Precast Direct", role: "Ready-mix & precast" },
  { name: "Bellwether SWE Plumbers", role: "Plumbing" },
  { name: "SolarBell", role: "Solar / renewable" },
  { name: "Besfleet", role: "Group logistics" },
];

export const CONTACTS = {
  supply: "supply@bricksplaza.co.za",
  sales: "sales.bricksplaza@besbpo.co.za",
  partners: "partners@besbpo.co.za",
};

export const LEGAL: Record<
  string,
  { title: string; updated: string; sections: { heading: string; body: string }[] }
> = {
  "terms-and-conditions": {
    title: "Terms & Conditions",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. Parties and governing law",
        body: "These terms govern the sale of goods by Bricksplaza, a specialised operating division of Besbpo Group, to customers in the Republic of South Africa. They are governed by the laws of the Republic of South Africa. Nothing in these terms limits rights under the Consumer Protection Act 68 of 2008 where that Act applies.",
      },
      {
        heading: "2. Catalogue and specification",
        body: "Every SKU is sold against the Master Product Catalogue: size, standard, duty class, sectors and fulfilment type as shown on the product page. Clay is a natural material; kiln variation within a colourway is inherent and not a defect. Sample panels are recommended before a full elevation is laid.",
      },
      {
        heading: "3. Orders, price and VAT",
        body: "Prices are in South African Rand and displayed inclusive or exclusive of VAT as indicated at checkout. Trade and volume discounts apply only to approved accounts and are re-validated server-side at checkout. Made-to-order SKUs include a 15% surcharge in the displayed price.",
      },
      {
        heading: "4. Delivery and collection",
        body: "Delivery fees are calculated on distance band from the nearest qualifying yard plus cart weight/pallet count. Long-distance (250 km+) orders are accepted with a quote to follow within one business day. Risk passes on collection or on signed delivery.",
      },
      {
        heading: "5. Contact",
        body: "Queries: sales.bricksplaza@besbpo.co.za. Supply desk: supply@bricksplaza.co.za.",
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. Responsible party",
        body: "Bricksplaza (a division of Besbpo Group) is the responsible party for personal information processed through this storefront, in terms of the Protection of Personal Information Act 4 of 2013 (POPIA).",
      },
      {
        heading: "2. What we process",
        body: "Identity and contact details, delivery addresses, order history, trade-account documents, payment references (not full card numbers — those are taken by the payment service provider), and site analytics via a POPIA-friendlier tool than GA4.",
      },
      {
        heading: "3. Why",
        body: "To fulfil orders, operate trade accounts, send transactional notices (email/SMS), improve the catalogue, and meet tax and record-keeping law. Marketing mail is opt-in.",
      },
      {
        heading: "4. Your rights",
        body: "Access, correction, deletion, objection and complaints to the Information Regulator are described on the POPIA Data Subject Rights page.",
      },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. What we use",
        body: "Strictly necessary cookies run the session, cart and checkout. Analytics cookies (PostHog/Plausible class) are used to understand catalogue search and checkout drop-off. We do not sell cookie data.",
      },
      {
        heading: "2. Control",
        body: "You can refuse non-essential cookies via the notice on first visit. The cart and account will still function.",
      },
    ],
  },
  "returns-and-refunds": {
    title: "Returns & Refunds Policy",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. Stock items",
        body: "Unopened, unused pallets of stock items may be returned within 10 business days of delivery, subject to a handling fee and transport. Clay that has been laid, cut or soiled is not returnable.",
      },
      {
        heading: "2. Made-to-order",
        body: "Made-to-order specials, cut lintels and scheduled kits are not returnable once production has started, except where the CPA requires otherwise.",
      },
      {
        heading: "3. Damages",
        body: "Note shortages and transit damage on the delivery note before the truck leaves. Photograph the pallet and send the note to supply@bricksplaza.co.za the same day.",
      },
    ],
  },
  "warranty-policy": {
    title: "Warranty Policy",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. Manufacturing",
        body: "Bricksplaza warrants that goods conform to the stated SANS / Agrément specification at the time of delivery. Colour variation within a declared colourway is not a warranty claim.",
      },
      {
        heading: "2. Site",
        body: "Workmanship, mortar specification, damp-proof courses and movement joints are the contractor’s responsibility. Misuse, salt attack from unsound sand, and structural movement are excluded.",
      },
    ],
  },
  "popia-data-subject-rights": {
    title: "POPIA Data Subject Rights",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. Your rights",
        body: "You may request access to, correction of, or deletion of personal information we hold, object to processing, and lodge a complaint with the Information Regulator (inforegulator.org.za).",
      },
      {
        heading: "2. How to ask",
        body: "Email supply@bricksplaza.co.za with “POPIA request” in the subject. We will verify identity against the account or order history before releasing information. Trade accounts above a credit-limit threshold may be escalated to a human review.",
      },
    ],
  },
  "acceptable-use-policy": {
    title: "Acceptable Use Policy",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. The storefront",
        body: "Do not scrape the catalogue for resale, probe payment endpoints, or submit abusive content in reviews or Q&A. Reviews are moderated in the Business Desk.",
      },
    ],
  },
  "trade-account-terms": {
    title: "Trade Account Terms",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. Credit",
        body: "Trade accounts are credit-vetted. Limits and net 7/14/30 terms are assigned by the Business Desk and enforced at checkout. Exceeding the limit requires a payment, a float top-up, or a new application.",
      },
      {
        heading: "2. Pricing",
        body: "Trade (12%) and Volume (20%) are server-authoritative. They never ride on a client-side flag.",
      },
    ],
  },
  "sale-of-goods-terms": {
    title: "Sale of Goods Terms",
    updated: "2026-09-01",
    sections: [
      {
        heading: "1. Title",
        body: "Title in the goods remains with Bricksplaza until paid in full. For trade accounts, title remains until the invoice is settled within the agreed terms.",
      },
      {
        heading: "2. Risk",
        body: "Risk passes on collection or on signed delivery, including crane/Hiab offload where that surcharge was accepted at checkout.",
      },
    ],
  },
};

export const SAMPLE_REVIEWS = [
  {
    name: "Thabo M.",
    city: "Sandton",
    rating: 5,
    title: "Colour held across the wall and the drive",
    body: "We specified Autumn Red face + matching paver. The elevation reads as one job, which is the whole point.",
  },
  {
    name: "Naledi K.",
    city: "Durban North",
    rating: 5,
    title: "Yard collection was actually same day",
    body: "Cato Ridge had the maxi on the floor. Paperwork took ten minutes. Trade price showed correctly once we were logged in.",
  },
  {
    name: "Johan V.",
    city: "Centurion",
    rating: 4,
    title: "MTO specials took a bit longer",
    body: "Bullnoses added a week, which the PDP had already warned us about. Quality was on spec.",
  },
  {
    name: "Priya S.",
    city: "Umhlanga",
    rating: 5,
    title: "Coverage calculator was honest",
    body: "Entered 84 m², ordered with 8% extra for herringbone, finished with half a pallet left. Perfect.",
  },
];
