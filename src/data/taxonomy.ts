export type FamilySlug =
  | "clay-masonry"
  | "concrete"
  | "hard-landscaping"
  | "specialist";

export type DutyClass =
  | "Pedestrian"
  | "Light Vehicular"
  | "Heavy-Duty"
  | "Extra Heavy-Duty"
  | "N/A";

export type Fulfilment = "Stock Item" | "Made-to-Order";

export type CustomerTier = "retail" | "trade" | "volume";

export const COLOURS = [
  { name: "Autumn Red", hex: "#A8412E", slug: "autumn-red" },
  { name: "Burgundy", hex: "#6B2430", slug: "burgundy" },
  { name: "Chocolate", hex: "#4A2C22", slug: "chocolate" },
  { name: "Corobrik Red", hex: "#B33A2B", slug: "corobrik-red" },
  { name: "Harvest Gold", hex: "#C4A05A", slug: "harvest-gold" },
  { name: "Imperial", hex: "#8B3A2A", slug: "imperial" },
  { name: "Kalahari", hex: "#C47A4A", slug: "kalahari" },
  { name: "Mocha", hex: "#6B4A3A", slug: "mocha" },
  { name: "Platinum", hex: "#9A9A96", slug: "platinum" },
  { name: "Sandstone", hex: "#C4B496", slug: "sandstone" },
  { name: "Slate", hex: "#4A4E52", slug: "slate" },
  { name: "Travertine", hex: "#D4C4A8", slug: "travertine" },
  { name: "Walnut", hex: "#5C3A28", slug: "walnut" },
  { name: "White", hex: "#E8E4DC", slug: "white" },
] as const;

export type ColourName = (typeof COLOURS)[number]["name"];

export const COLOUR_BY_NAME = Object.fromEntries(
  COLOURS.map((c) => [c.name, c]),
) as Record<ColourName, (typeof COLOURS)[number]>;

export const FAMILIES: {
  slug: FamilySlug;
  name: string;
  blurb: string;
}[] = [
  {
    slug: "clay-masonry",
    name: "Clay Masonry",
    blurb: "Kiln-fired face, semi-face, maxi and engineering bricks — the core of the Bricksplaza range.",
  },
  {
    slug: "concrete",
    name: "Concrete & Cementitious",
    blurb: "Blocks, AAC, CSEB, lintels and mortars for structure, speed and specification work.",
  },
  {
    slug: "hard-landscaping",
    name: "Hard Landscaping",
    blurb: "Pavers, cobbles, slabs, retaining and coping — colour-matched to the walling range.",
  },
  {
    slug: "specialist",
    name: "Specialist Systems",
    blurb: "Brick slips, braai kits and the newest additions to the catalogue.",
  },
];

export type CategoryDef = {
  slug: string;
  name: string;
  family: FamilySlug;
  prefix: string;
  blurb: string;
  standard: string;
  unit: string;
  agreement?: boolean;
  newRange?: boolean;
};

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "clay-face-bricks",
    name: "Clay Face Bricks",
    family: "clay-masonry",
    prefix: "CFB",
    blurb: "Premium kiln-fired facing bricks in 14 colourways. The hero of every Bricksplaza elevation.",
    standard: "SANS 227",
    unit: "Per 1,000 units",
  },
  {
    slug: "semi-face-bricks",
    name: "Semi-Face Bricks",
    family: "clay-masonry",
    prefix: "SFB",
    blurb: "The colour-matched partner to face brick — specified on returns, gables and economy elevations.",
    standard: "SANS 227",
    unit: "Per 1,000 units",
  },
  {
    slug: "clay-maxi-bricks",
    name: "Clay Maxi Bricks",
    family: "clay-masonry",
    prefix: "MXB",
    blurb: "Larger-format clay units for faster laying rates on residential and commercial walls.",
    standard: "SANS 227",
    unit: "Per 1,000 units",
  },
  {
    slug: "stock-bricks",
    name: "Stock Bricks",
    family: "clay-masonry",
    prefix: "STB",
    blurb: "Plaster-quality clay stock for internal skins and rendered work.",
    standard: "SANS 227",
    unit: "Per 1,000 units",
  },
  {
    slug: "engineering-bricks",
    name: "Engineering Bricks",
    family: "clay-masonry",
    prefix: "ENB",
    blurb: "Dense, low-absorption clay engineering units for damp-proof courses, manholes and civil work.",
    standard: "SANS 227 Class A",
    unit: "Per 1,000 units",
  },
  {
    slug: "fire-bricks",
    name: "Fire Bricks",
    family: "clay-masonry",
    prefix: "FRB",
    blurb: "Refractory clay firebricks for braais, pizza ovens, kilns and industrial hearths.",
    standard: "SANS 941",
    unit: "Per 1,000 units",
  },
  {
    slug: "clay-specials",
    name: "Clay Specials",
    family: "clay-masonry",
    prefix: "CSP",
    blurb: "Cants, bulls, plinths, squints and made-to-order architectural specials.",
    standard: "SANS 227",
    unit: "Per 1,000 units",
  },
  {
    slug: "concrete-blocks",
    name: "Concrete Blocks",
    family: "concrete",
    prefix: "CBL",
    blurb: "Hollow and solid concrete masonry units for loadbearing and infill walls.",
    standard: "SANS 1215",
    unit: "Per unit",
  },
  {
    slug: "concrete-maxi",
    name: "Concrete Maxi Bricks",
    family: "concrete",
    prefix: "CMX",
    blurb: "Cement-based maxi format for plastered construction at pace.",
    standard: "SANS 1215",
    unit: "Per 1,000 units",
  },
  {
    slug: "aac-blocks",
    name: "AAC Blocks",
    family: "concrete",
    prefix: "AAC",
    blurb: "Autoclaved aerated concrete — light, insulated, Agrément-certified. New to the range.",
    standard: "Agrément SA / SANS 507",
    unit: "Per unit",
    agreement: true,
    newRange: true,
  },
  {
    slug: "cseb",
    name: "CSEB",
    family: "concrete",
    prefix: "CSB",
    blurb: "Compressed stabilised earth blocks for low-carbon walls. Agrément-certified. New to the range.",
    standard: "Agrément SA",
    unit: "Per unit",
    agreement: true,
    newRange: true,
  },
  {
    slug: "lintels",
    name: "Lintels",
    family: "concrete",
    prefix: "LNT",
    blurb: "Precast concrete lintels, cut-to-size available from the KZN and Gauteng yards.",
    standard: "SANS 1504",
    unit: "Per unit",
  },
  {
    slug: "mortar-accessories",
    name: "Mortar, Sand & Sealers",
    family: "concrete",
    prefix: "MRT",
    blurb: "Class I/II mortar, jointing sand and sealers — the finishing kit around every masonry order.",
    standard: "SANS 1090",
    unit: "Per bag / drum",
  },
  {
    slug: "clay-pavers",
    name: "Clay Pavers",
    family: "hard-landscaping",
    prefix: "CPV",
    blurb: "Kiln-fired clay pavers colour-matched to the face-brick range. The Bricksplaza differentiator.",
    standard: "SANS 1058",
    unit: "Per m²",
  },
  {
    slug: "concrete-pavers",
    name: "Concrete Pavers",
    family: "hard-landscaping",
    prefix: "CNP",
    blurb: "Interlocking and rectangular concrete pavers for driveways, yards and municipal work.",
    standard: "SANS 1058",
    unit: "Per m²",
  },
  {
    slug: "cobbles",
    name: "Cobbles",
    family: "hard-landscaping",
    prefix: "COB",
    blurb: "Clay and concrete cobbles for courtyards, circles and feature bands.",
    standard: "SANS 1058",
    unit: "Per m²",
  },
  {
    slug: "slabs",
    name: "Slabs & Flagstones",
    family: "hard-landscaping",
    prefix: "SLB",
    blurb: "Pressed slabs and flagstones for patios, walkways and podium decks.",
    standard: "SANS 1058",
    unit: "Per m²",
  },
  {
    slug: "retaining-blocks",
    name: "Retaining Wall Blocks",
    family: "hard-landscaping",
    prefix: "RET",
    blurb: "Dry-stack retaining systems for terraces, cuttings and estate earthworks.",
    standard: "SANS 207",
    unit: "Per unit",
  },
  {
    slug: "coping",
    name: "Coping & Capping",
    family: "hard-landscaping",
    prefix: "COP",
    blurb: "Wall copings and pool copings that close a colour-matched elevation.",
    standard: "SANS 227",
    unit: "Per unit",
  },
  {
    slug: "brick-slips",
    name: "Brick Slips",
    family: "specialist",
    prefix: "BSL",
    blurb: "Thin clay slips for cladding, interiors and lightweight façades. New to the range.",
    standard: "SANS 227",
    unit: "Per m²",
    newRange: true,
  },
  {
    slug: "braai-kits",
    name: "Braai Kits",
    family: "specialist",
    prefix: "BRK",
    blurb: "Packaged outdoor braai kits — brick count, firebrick, grate and flue scheduled. New to the range.",
    standard: "SANS 941 / Kit schedule",
    unit: "Per kit",
    newRange: true,
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, CategoryDef>;

export const SECTORS = [
  "Residential",
  "Commercial",
  "Industrial",
  "Institutional",
  "Civil",
] as const;

export const PROVINCES = [
  {
    slug: "gauteng",
    name: "Gauteng",
    mode: "yard" as const,
    yard: "Midrand Distribution Yard",
    blurb: "Primary kiln-to-yard fulfilment for Johannesburg, Pretoria, Ekurhuleni and the West Rand.",
  },
  {
    slug: "kwazulu-natal",
    name: "KwaZulu-Natal",
    mode: "yard" as const,
    yard: "Cato Ridge Distribution Yard",
    blurb: "KZN coastal and midlands fulfilment — Durban, Pietermaritzburg and the North Coast.",
  },
  {
    slug: "western-cape",
    name: "Western Cape",
    mode: "online" as const,
    yard: null,
    blurb: "Online-first with quoted long-distance freight into Cape Town, Stellenbosch and the Garden Route.",
  },
  {
    slug: "eastern-cape",
    name: "Eastern Cape",
    mode: "online" as const,
    yard: null,
    blurb: "Online-first into Gqeberha, East London and the hinterland.",
  },
  {
    slug: "free-state",
    name: "Free State",
    mode: "online" as const,
    yard: null,
    blurb: "Online-first into Bloemfontein, Welkom and the goldfields.",
  },
  {
    slug: "north-west",
    name: "North West",
    mode: "online" as const,
    yard: null,
    blurb: "Online-first into Rustenburg, Mahikeng and the platinum belt.",
  },
  {
    slug: "limpopo",
    name: "Limpopo",
    mode: "online" as const,
    yard: null,
    blurb: "Online-first into Polokwane and the northern corridor.",
  },
  {
    slug: "mpumalanga",
    name: "Mpumalanga",
    mode: "online" as const,
    yard: null,
    blurb: "Online-first into Mbombela, eMalahleni and the Highveld mills.",
  },
  {
    slug: "northern-cape",
    name: "Northern Cape",
    mode: "online" as const,
    yard: null,
    blurb: "Online-first into Kimberley, Upington and the long-haul west.",
  },
];

export const TIER_DISCOUNT: Record<CustomerTier, number> = {
  retail: 0,
  trade: 0.12,
  volume: 0.2,
};

export const TIER_LABEL: Record<CustomerTier, string> = {
  retail: "Retail",
  trade: "Trade (12% off)",
  volume: "Volume (20% off)",
};

export const MTO_SURCHARGE = 0.15;
