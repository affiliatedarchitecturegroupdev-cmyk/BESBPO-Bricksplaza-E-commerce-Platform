import {
  CATEGORIES,
  CATEGORY_BY_SLUG,
  COLOUR_BY_NAME,
  COLOURS,
  MTO_SURCHARGE,
  type ColourName,
  type DutyClass,
  type Fulfilment,
} from "./taxonomy";
import { round2 } from "@/lib/format";

export type Product = {
  sku: string;
  categorySlug: string;
  category: string;
  family: string;
  productType: string;
  productName: string;
  colourFinish: ColourName | string;
  colourHex: string;
  sizeMm: string;
  thicknessMm: string;
  lengthMm: number;
  widthMm: number;
  unitOfSale: string;
  applicableStandard: string;
  dutyLoadClass: DutyClass;
  sectorsServed: string[];
  fulfilmentType: Fulfilment;
  unitCost: number;
  retailPrice: number;
  tradePrice: number;
  volumePrice: number;
  coveragePerM2: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew: boolean;
  isClearance: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  weightKg: number;
  unitsPerPallet: number;
  description: string;
};

type Dim = { l: number; w: number; t: number };

type BuildSpec = {
  categorySlug: string;
  types: string[];
  colours: readonly (ColourName | string)[];
  sizes: Dim[];
  duty: DutyClass;
  sectors: string[];
  baseCost: number;
  markup: number;
  coverage: boolean;
  weightKg: number;
  unitsPerPallet: number;
  mixedMto?: boolean;
  mtoOnly?: boolean;
};

function rng(seed: number) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function dimLabel(d: Dim) {
  return `${d.l}×${d.w}×${d.t}`;
}

function coverage(d: Dim) {
  return round2((1000 / d.l) * (1000 / d.w));
}

const ALL_COLOURS = COLOURS.map((c) => c.name);
const CLAY_COLOURS = ALL_COLOURS;
const PAVER_COLOURS = ALL_COLOURS.filter((n) => n !== "White");
const EARTH = ["Kalahari", "Mocha", "Sandstone", "Chocolate", "Walnut", "Harvest Gold"] as ColourName[];
const GREYS = ["Slate", "Platinum", "White", "Travertine"] as ColourName[];
const REDS = ["Autumn Red", "Burgundy", "Corobrik Red", "Imperial"] as ColourName[];

const BRICK = { l: 222, w: 106, t: 73 };
const BRICK_NARROW = { l: 222, w: 90, t: 73 };
const BRICK_WIDE = { l: 222, w: 140, t: 73 };
const MAXI = { l: 222, w: 90, t: 140 };
const MAXI2 = { l: 222, w: 106, t: 140 };
const MAXI3 = { l: 222, w: 140, t: 140 };
const ENG = { l: 222, w: 106, t: 73 };
const ENG2 = { l: 222, w: 106, t: 65 };
const FIRE = { l: 230, w: 114, t: 76 };
const FIRE2 = { l: 230, w: 114, t: 64 };
const BLOCK_H = { l: 390, w: 190, t: 190 };
const BLOCK_M = { l: 390, w: 140, t: 190 };
const BLOCK_N = { l: 390, w: 90, t: 190 };
const BLOCK_S = { l: 390, w: 190, t: 90 };
const AAC1 = { l: 600, w: 200, t: 250 };
const AAC2 = { l: 600, w: 150, t: 250 };
const AAC3 = { l: 600, w: 100, t: 250 };
const AAC4 = { l: 600, w: 250, t: 250 };
const CSEB1 = { l: 295, w: 140, t: 90 };
const CSEB2 = { l: 295, w: 140, t: 115 };
const PAV1 = { l: 200, w: 100, t: 50 };
const PAV2 = { l: 200, w: 100, t: 60 };
const PAV3 = { l: 220, w: 110, t: 50 };
const PAV4 = { l: 200, w: 100, t: 80 };
const PAV5 = { l: 220, w: 110, t: 65 };
const COB1 = { l: 100, w: 100, t: 50 };
const COB2 = { l: 80, w: 80, t: 60 };
const SLB1 = { l: 400, w: 400, t: 40 };
const SLB2 = { l: 600, w: 400, t: 45 };
const SLB3 = { l: 450, w: 450, t: 50 };
const RET1 = { l: 400, w: 300, t: 200 };
const RET2 = { l: 450, w: 350, t: 200 };
const COP1 = { l: 222, w: 150, t: 50 };
const COP2 = { l: 222, w: 220, t: 50 };
const SLIP1 = { l: 222, w: 73, t: 15 };
const SLIP2 = { l: 222, w: 65, t: 20 };
const SLIP3 = { l: 210, w: 65, t: 18 };

const SPECS: BuildSpec[] = [
  {
    categorySlug: "clay-face-bricks",
    types: ["Satin Smooth Face Brick", "Rustic Face Brick", "Wirecut Face Brick", "Sandstock Face Brick"],
    colours: CLAY_COLOURS,
    sizes: [BRICK, BRICK_NARROW, BRICK_WIDE, { l: 222, w: 106, t: 50 }, { l: 222, w: 106, t: 65 }, { l: 190, w: 90, t: 90 }],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 3200,
    markup: 2.55,
    coverage: false,
    weightKg: 2.6,
    unitsPerPallet: 500,
  },
  {
    categorySlug: "semi-face-bricks",
    types: ["Semi-Face Smooth", "Semi-Face Textured", "Semi-Face Rustic"],
    colours: CLAY_COLOURS,
    sizes: [BRICK, BRICK_NARROW, MAXI, { l: 222, w: 106, t: 65 }, { l: 222, w: 140, t: 73 }],
    duty: "N/A",
    sectors: ["Residential", "Commercial"],
    baseCost: 2450,
    markup: 2.4,
    coverage: false,
    weightKg: 2.5,
    unitsPerPallet: 500,
  },
  {
    categorySlug: "clay-maxi-bricks",
    types: ["Clay Maxi Smooth", "Clay Maxi Textured"],
    colours: CLAY_COLOURS,
    sizes: [MAXI, MAXI2, MAXI3],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Industrial"],
    baseCost: 4100,
    markup: 2.35,
    coverage: false,
    weightKg: 3.8,
    unitsPerPallet: 350,
  },
  {
    categorySlug: "stock-bricks",
    types: ["Plaster Stock", "NFP Stock"],
    colours: ["Chocolate", "Mocha", "Kalahari", "Sandstone", "Walnut", "Slate", "Autumn Red", "Platinum", "White", "Harvest Gold"],
    sizes: [BRICK, BRICK_NARROW, MAXI, { l: 222, w: 106, t: 73 }],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Industrial"],
    baseCost: 1650,
    markup: 2.2,
    coverage: false,
    weightKg: 2.4,
    unitsPerPallet: 500,
  },
  {
    categorySlug: "engineering-bricks",
    types: ["Class A Engineering", "Class B Engineering"],
    colours: ["Slate", "Chocolate", "Burgundy", "Platinum", "Autumn Red", "Walnut"],
    sizes: [ENG, ENG2, { l: 222, w: 106, t: 73 }, { l: 222, w: 102, t: 65 }],
    duty: "N/A",
    sectors: ["Civil", "Industrial", "Commercial"],
    baseCost: 3800,
    markup: 2.5,
    coverage: false,
    weightKg: 3.1,
    unitsPerPallet: 448,
  },
  {
    categorySlug: "fire-bricks",
    types: ["High Alumina Firebrick", "Medium Duty Firebrick", "Braai Firebrick"],
    colours: ["Harvest Gold", "Kalahari", "Chocolate", "Imperial"],
    sizes: [FIRE, FIRE2, { l: 230, w: 114, t: 50 }],
    duty: "N/A",
    sectors: ["Residential", "Industrial"],
    baseCost: 6200,
    markup: 2.45,
    coverage: false,
    weightKg: 3.4,
    unitsPerPallet: 400,
    mixedMto: true,
  },
  {
    categorySlug: "clay-specials",
    types: ["Single Cant", "Double Cant", "Bullnose", "Plinth", "Squint"],
    colours: CLAY_COLOURS,
    sizes: [BRICK, BRICK_NARROW],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 5400,
    markup: 2.7,
    coverage: false,
    weightKg: 2.4,
    unitsPerPallet: 300,
    mtoOnly: true,
  },
  {
    categorySlug: "concrete-blocks",
    types: ["Hollow Block", "Solid Block", "Maxi Hollow"],
    colours: ["Platinum", "Slate", "White", "Sandstone", "Chocolate", "Kalahari"],
    sizes: [BLOCK_H, BLOCK_M, BLOCK_N, BLOCK_S, { l: 390, w: 140, t: 90 }, { l: 390, w: 190, t: 140 }],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Industrial", "Institutional"],
    baseCost: 14.5,
    markup: 2.3,
    coverage: false,
    weightKg: 18,
    unitsPerPallet: 90,
  },
  {
    categorySlug: "concrete-maxi",
    types: ["Cement Maxi", "Cement Maxi Smooth"],
    colours: ["Platinum", "White", "Sandstone", "Slate"],
    sizes: [MAXI, MAXI2, MAXI3],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Industrial"],
    baseCost: 2100,
    markup: 2.25,
    coverage: false,
    weightKg: 4.1,
    unitsPerPallet: 350,
  },
  {
    categorySlug: "aac-blocks",
    types: ["AAC Standard", "AAC Precision"],
    colours: ["White", "Platinum"],
    sizes: [AAC1, AAC2, AAC3, AAC4, { l: 600, w: 200, t: 200 }, { l: 600, w: 300, t: 250 }, { l: 600, w: 75, t: 250 }],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 38,
    markup: 2.4,
    coverage: false,
    weightKg: 12,
    unitsPerPallet: 48,
  },
  {
    categorySlug: "cseb",
    types: ["CSEB Stabilised", "CSEB Faced"],
    colours: EARTH,
    sizes: [CSEB1, CSEB2, { l: 295, w: 140, t: 140 }, { l: 295, w: 90, t: 90 }],
    duty: "N/A",
    sectors: ["Residential", "Institutional", "Civil"],
    baseCost: 22,
    markup: 2.35,
    coverage: false,
    weightKg: 8.5,
    unitsPerPallet: 200,
  },
  {
    categorySlug: "lintels",
    types: ["Precast Lintel 110", "Precast Lintel 140", "Precast Lintel 190"],
    colours: ["Platinum"],
    sizes: [
      { l: 900, w: 110, t: 70 },
      { l: 1200, w: 110, t: 70 },
      { l: 1500, w: 110, t: 70 },
      { l: 1800, w: 110, t: 70 },
      { l: 2100, w: 140, t: 70 },
      { l: 2400, w: 140, t: 70 },
      { l: 2700, w: 190, t: 90 },
      { l: 3000, w: 190, t: 90 },
    ],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 95,
    markup: 2.2,
    coverage: false,
    weightKg: 28,
    unitsPerPallet: 20,
    mixedMto: true,
  },
  {
    categorySlug: "mortar-accessories",
    types: [
      "Class II Masonry Mortar",
      "Class I Masonry Mortar",
      "Jointing Sand",
      "Paver Sealer",
      "Face Brick Sealer",
      "Mortar Plasticiser",
    ],
    colours: ["Sandstone", "Slate", "Autumn Red", "Platinum"],
    sizes: [{ l: 0, w: 0, t: 0 }],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Civil"],
    baseCost: 85,
    markup: 2.15,
    coverage: false,
    weightKg: 40,
    unitsPerPallet: 40,
  },
  {
    categorySlug: "clay-pavers",
    types: ["Clay Paver Smooth", "Clay Paver Rustic", "Clay Paver Chamfered"],
    colours: PAVER_COLOURS,
    sizes: [PAV1, PAV2, PAV3, PAV4, PAV5],
    duty: "Light Vehicular",
    sectors: ["Residential", "Commercial", "Civil"],
    baseCost: 95,
    markup: 2.6,
    coverage: true,
    weightKg: 2.3,
    unitsPerPallet: 500,
  },
  {
    categorySlug: "concrete-pavers",
    types: ["Rect Paver", "Bevel Paver", "Zigzag Interlock", "Cobble-Look Paver"],
    colours: ["Slate", "Platinum", "Sandstone", "Charcoal Mix", "Terracotta", "Autumn Red", "Kalahari", "Walnut", "Burgundy", "Harvest Gold"],
    sizes: [PAV1, PAV2, PAV3, PAV4, PAV5],
    duty: "Heavy-Duty",
    sectors: ["Residential", "Commercial", "Civil", "Industrial"],
    baseCost: 72,
    markup: 2.45,
    coverage: true,
    weightKg: 2.8,
    unitsPerPallet: 480,
  },
  {
    categorySlug: "cobbles",
    types: ["Clay Cobble", "Concrete Cobble", "Tumbled Cobble"],
    colours: [...REDS, "Sandstone", "Slate", "Kalahari", "Walnut", "Harvest Gold", "Platinum", "Mocha", "Travertine"],
    sizes: [COB1, COB2, { l: 120, w: 120, t: 50 }],
    duty: "Pedestrian",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 110,
    markup: 2.55,
    coverage: true,
    weightKg: 1.6,
    unitsPerPallet: 600,
  },
  {
    categorySlug: "slabs",
    types: ["Pressed Slab", "Riven Flag", "Exposed Aggregate Slab"],
    colours: ["Sandstone", "Slate", "Platinum", "Travertine", "White", "Kalahari"],
    sizes: [SLB1, SLB2, SLB3, { l: 500, w: 500, t: 40 }],
    duty: "Pedestrian",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 88,
    markup: 2.4,
    coverage: true,
    weightKg: 18,
    unitsPerPallet: 40,
  },
  {
    categorySlug: "retaining-blocks",
    types: ["Garden Retainer", "Heavy Retainer", "Plantable Retainer"],
    colours: ["Sandstone", "Slate", "Kalahari", "Chocolate", "Platinum", "Walnut"],
    sizes: [RET1, RET2, { l: 400, w: 250, t: 180 }],
    duty: "N/A",
    sectors: ["Residential", "Civil", "Commercial"],
    baseCost: 48,
    markup: 2.3,
    coverage: false,
    weightKg: 22,
    unitsPerPallet: 36,
  },
  {
    categorySlug: "coping",
    types: ["Wall Coping", "Pool Coping", "Once-Weathered Coping"],
    colours: CLAY_COLOURS,
    sizes: [COP1, COP2],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 36,
    markup: 2.5,
    coverage: false,
    weightKg: 4.2,
    unitsPerPallet: 80,
    mixedMto: true,
  },
  {
    categorySlug: "brick-slips",
    types: ["Clay Brick Slip", "Corner Slip", "Flexible Slip"],
    colours: CLAY_COLOURS,
    sizes: [SLIP1, SLIP2, SLIP3],
    duty: "N/A",
    sectors: ["Residential", "Commercial", "Institutional"],
    baseCost: 145,
    markup: 2.65,
    coverage: true,
    weightKg: 0.55,
    unitsPerPallet: 40,
  },
  {
    categorySlug: "braai-kits",
    types: ["Single Braai Kit", "Double Braai Kit", "Island Braai Kit"],
    colours: [...REDS, "Sandstone", "Kalahari", "Slate", "White"],
    sizes: [{ l: 1600, w: 700, t: 900 }],
    duty: "N/A",
    sectors: ["Residential"],
    baseCost: 4200,
    markup: 2.2,
    coverage: false,
    weightKg: 380,
    unitsPerPallet: 1,
    mixedMto: true,
  },
];

function dutyFor(spec: BuildSpec, type: string, size: Dim): DutyClass {
  if (spec.categorySlug === "clay-pavers" || spec.categorySlug === "concrete-pavers") {
    if (size.t >= 80) return "Extra Heavy-Duty";
    if (size.t >= 60) return "Heavy-Duty";
    if (type.includes("Interlock") || type.includes("Chamfered")) return "Light Vehicular";
    return "Pedestrian";
  }
  return spec.duty;
}

function colourHex(name: string) {
  if (name in COLOUR_BY_NAME) return COLOUR_BY_NAME[name as ColourName].hex;
  if (name === "Charcoal Mix") return "#3F4246";
  if (name === "Terracotta") return "#C45A32";
  return "#8A6A55";
}

function unitLabel(spec: BuildSpec, type: string) {
  if (spec.categorySlug === "mortar-accessories") {
    if (type.includes("Sealer") || type.includes("Plasticiser")) return "Per 20ℓ drum";
    return "Per 40kg bag";
  }
  return CATEGORY_BY_SLUG[spec.categorySlug].unit;
}

function buildCatalogue(): Product[] {
  const products: Product[] = [];
  const counters: Record<string, number> = {};

  for (const spec of SPECS) {
    const cat = CATEGORY_BY_SLUG[spec.categorySlug];
    for (const type of spec.types) {
      for (const colour of spec.colours) {
        for (const size of spec.sizes) {
          counters[cat.prefix] = (counters[cat.prefix] ?? 0) + 1;
          const n = counters[cat.prefix];
          const sku = `BP-${cat.prefix}-${String(n).padStart(4, "0")}`;
          const rand = rng(hashStr(sku));
          const mto = spec.mtoOnly ? true : spec.mixedMto ? rand() > 0.72 : rand() > 0.88;
          const fulfilment: Fulfilment = mto ? "Made-to-Order" : "Stock Item";
          const colourMod = 0.92 + (hashStr(String(colour)) % 17) / 100;
          const sizeMod = size.t ? 0.9 + size.t / 400 : 1;
          let cost = round2(spec.baseCost * colourMod * sizeMod);
          if (spec.categorySlug === "lintels") cost = round2(spec.baseCost * (size.l / 1200));
          if (spec.categorySlug === "braai-kits") {
            cost = round2(spec.baseCost * (type.startsWith("Double") ? 1.65 : type.startsWith("Island") ? 2.4 : 1));
          }
          let retail = round2(cost * spec.markup);
          if (mto) {
            cost = round2(cost * (1 + MTO_SURCHARGE));
            retail = round2(retail * (1 + MTO_SURCHARGE));
          }
          const trade = round2(retail * 0.88);
          const volume = round2(retail * 0.8);
          const rating = round2(3.9 + rand() * 1.1);
          const reviewCount = Math.floor(rand() * 64);
          const stock = mto ? 0 : Math.floor(40 + rand() * (spec.unitsPerPallet * 8));
          const sizeMm = size.l ? dimLabel(size) : "—";
          const thicknessMm = size.t ? String(size.t) : "—";
          const name =
            spec.categorySlug === "mortar-accessories"
              ? `${type} · ${colour}`
              : spec.categorySlug === "braai-kits"
                ? `${type} · ${colour}`
                : spec.categorySlug === "lintels"
                  ? `${type} · ${size.l}mm`
                  : `${type} · ${colour} · ${sizeMm}`;
          const clearance = colour === "Platinum" || colour === "Travertine" ? rand() > 0.55 : rand() > 0.97;
          const product: Product = {
            sku,
            categorySlug: cat.slug,
            category: cat.name,
            family: cat.family,
            productType: type,
            productName: name,
            colourFinish: colour,
            colourHex: colourHex(colour),
            sizeMm,
            thicknessMm,
            lengthMm: size.l,
            widthMm: size.w,
            unitOfSale: unitLabel(spec, type),
            applicableStandard: cat.standard,
            dutyLoadClass: dutyFor(spec, type, size),
            sectorsServed: spec.sectors,
            fulfilmentType: fulfilment,
            unitCost: cost,
            retailPrice: retail,
            tradePrice: trade,
            volumePrice: volume,
            coveragePerM2: spec.coverage && size.l ? coverage(size) : null,
            rating,
            reviewCount,
            stock,
            isNew: Boolean(cat.newRange),
            isClearance: clearance && !cat.newRange,
            isTrending: rand() > 0.86,
            isBestSeller: rating >= 4.6 && reviewCount > 18,
            weightKg: spec.weightKg,
            unitsPerPallet: spec.unitsPerPallet,
            description: `${type} in ${colour}${size.l ? `, ${sizeMm} mm` : ""}. Manufactured to ${cat.standard}. ${fulfilment === "Made-to-Order" ? "Made-to-order (15% surcharge already in the price)." : "Stock item from the Gauteng or KZN yard."} Specified for ${spec.sectors.join(", ").toLowerCase()} work.`,
          };
          products.push(product);
        }
      }
    }
  }

  products.sort((a, b) => a.sku.localeCompare(b.sku));
  if (products.length > 2044) return products.slice(0, 2044);
  return products;
}

let _all: Product[] | null = null;
let _bySku: Map<string, Product> | null = null;

export function getCatalogue(): Product[] {
  if (!_all) _all = buildCatalogue();
  return _all;
}

export function getProduct(sku: string) {
  if (!_bySku) {
    _bySku = new Map(getCatalogue().map((p) => [p.sku, p]));
  }
  return _bySku.get(sku);
}

export function productsByCategory(slug: string) {
  return getCatalogue().filter((p) => p.categorySlug === slug);
}

const PRODUCT_PHOTOS = import.meta.glob("../../public/images/products/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const PHOTO_BY_SKU = new Map(
  Object.entries(PRODUCT_PHOTOS).map(([path, url]) => {
    const file = path.split("/").pop() ?? "";
    const sku = file.replace(/\.(jpe?g|png|webp)$/i, "");
    return [sku, url] as const;
  }),
);

/** Resolved URL when `public/images/products/{SKU}.jpg` (or png/webp) is present. */
export function productImage(p: Product): string | null {
  return PHOTO_BY_SKU.get(p.sku) ?? null;
}

export function colourMatched(p: Product, limit = 6): Product[] {
  const relatedCats =
    p.family === "clay-masonry" || p.categorySlug === "clay-pavers" || p.categorySlug === "brick-slips"
      ? ["clay-face-bricks", "semi-face-bricks", "clay-pavers", "brick-slips", "coping"]
      : [p.categorySlug];
  const order = ["clay-face-bricks", "semi-face-bricks", "clay-pavers", "brick-slips", "coping"];
  return getCatalogue()
    .filter(
      (o) =>
        o.sku !== p.sku &&
        o.colourFinish === p.colourFinish &&
        relatedCats.includes(o.categorySlug),
    )
    .sort((a, b) => order.indexOf(a.categorySlug) - order.indexOf(b.categorySlug) || a.sku.localeCompare(b.sku))
    .slice(0, limit);
}

export function relatedProducts(p: Product, limit = 8): Product[] {
  return getCatalogue()
    .filter((o) => o.sku !== p.sku && o.categorySlug === p.categorySlug)
    .sort((a, b) => Math.abs(a.retailPrice - p.retailPrice) - Math.abs(b.retailPrice - p.retailPrice))
    .slice(0, limit);
}

export function frequentlyBought(p: Product): Product[] {
  const extras = getCatalogue().filter((o) => {
    if (p.categorySlug.includes("paver") || p.categorySlug === "cobbles" || p.categorySlug === "slabs") {
      return (
        o.productType === "Jointing Sand" ||
        o.productType === "Paver Sealer" ||
        (o.categorySlug === "clay-face-bricks" && o.colourFinish === p.colourFinish)
      );
    }
    if (p.categorySlug.includes("brick") || p.categorySlug === "clay-face-bricks") {
      return o.productType === "Class II Masonry Mortar" || o.productType === "Face Brick Sealer";
    }
    return false;
  });
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const e of extras) {
    if (seen.has(e.productType)) continue;
    seen.add(e.productType);
    out.push(e);
    if (out.length >= 3) break;
  }
  return out;
}

export const CATALOGUE_COUNT = getCatalogue().length;
