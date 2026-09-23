import { applyQueryIntel } from "@/lib/search";
import { CATEGORY_BY_SLUG } from "@/data/taxonomy";

export type AdCreative = "html" | "image";

export type AdCampaign = {
  eyebrow: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  image: string | null;
};

export type AdSlot = {
  id: string;
  slotNumber: number;
  name: string;
  placement: string;
  position: string;
  width: number;
  height: number;
  creativeType: AdCreative;
  imageFile?: string;
  campaign: AdCampaign;
};

/** Launch campaigns from the creative pack.
 *  Photography is yard imagery on the storefront (the pack’s Unsplash URLs are not reachable here).
 *  Slots 5, 7 and 8 are the flat brick-graphic PNGs.
 *  Trade copy follows the pricing engine (Trade 12% / Volume 20%), not a flat 20% off. */
export const AD_SLOTS: AdSlot[] = [
  {
    id: "hero-banner",
    slotNumber: 1,
    name: "Homepage Hero Banner",
    placement: "homepage",
    position: "below-hero-slider",
    width: 1600,
    height: 400,
    creativeType: "html",
    campaign: {
      eyebrow: "Bricksplaza",
      headline: "Every Brick, Every Build.",
      subtext: "2,044 SKUs across 21 categories — South Africa’s most comprehensive masonry range.",
      ctaText: "Explore the Range",
      ctaLink: "/shop",
      image: "/images/hero/facade.jpg",
    },
  },
  {
    id: "midpage-banner",
    slotNumber: 2,
    name: "Homepage Mid-Page Banner",
    placement: "homepage",
    position: "after-section-5",
    width: 1600,
    height: 300,
    creativeType: "html",
    campaign: {
      eyebrow: "Strategic Partners Programme",
      headline: "Supplying Construction Companies, Developers & Hardware Stores",
      subtext: "Tiered pricing, dedicated account management, and credit terms built for your business.",
      ctaText: "See Partner Programmes",
      ctaLink: "/partners",
      image: "/images/hero/commercial.jpg",
    },
  },
  {
    id: "inrail-banner-1",
    slotNumber: 3,
    name: "In-Rail Native Banner",
    placement: "homepage",
    position: "after-section-9",
    width: 1200,
    height: 250,
    creativeType: "html",
    campaign: {
      eyebrow: "Paving Season",
      headline: "16 Paver Profiles. 14 Colourways.",
      subtext: "From pedestrian pathways to extra-heavy-duty industrial yards.",
      ctaText: "Shop Pavers",
      ctaLink: "/search?q=pavers",
      image: "/images/hero/driveway.jpg",
    },
  },
  {
    id: "inrail-banner-2",
    slotNumber: 4,
    name: "In-Rail Native Banner",
    placement: "homepage",
    position: "after-section-13",
    width: 1200,
    height: 250,
    creativeType: "html",
    campaign: {
      eyebrow: "Trade Accounts",
      headline: "Register for Trade Pricing",
      subtext: "Trade is 12% off retail. Volume is 20% — on every SKU, once the account is approved.",
      ctaText: "Apply Now",
      ctaLink: "/trade",
      image: "/images/hero/yard.jpg",
    },
  },
  {
    id: "search-banner",
    slotNumber: 5,
    name: "Search Results Banner",
    placement: "search-results",
    position: "top-of-results",
    width: 1200,
    height: 150,
    creativeType: "image",
    imageFile: "/ads/ad-05-search-banner.png",
    campaign: {
      eyebrow: "",
      headline: "Can't find what you need?",
      subtext: "",
      ctaText: "Request a Bulk Quote",
      ctaLink: "/rfq",
      image: null,
    },
  },
  {
    id: "product-crosssell",
    slotNumber: 6,
    name: "Product Cross-Sell Banner",
    placement: "product-detail",
    position: "below-related-products",
    width: 800,
    height: 200,
    creativeType: "html",
    campaign: {
      eyebrow: "Complete the Project",
      headline: "Add Jointing Sand & Sealer",
      subtext: "The finishing kit that belongs on the same load as the pavers.",
      ctaText: "Add the finishing kit",
      ctaLink: "/bundles/paving-finishing-kit",
      image: "/images/projects/patio.jpg",
    },
  },
  {
    id: "cart-banner",
    slotNumber: 7,
    name: "Cart Banner",
    placement: "cart",
    position: "above-order-summary",
    width: 700,
    height: 150,
    creativeType: "image",
    imageFile: "/ads/ad-07-cart-banner.png",
    campaign: {
      eyebrow: "",
      headline: "Forgot the sundries?",
      subtext: "",
      ctaText: "Add Brickforce, Sand & Sealer",
      ctaLink: "/bundles/paving-finishing-kit",
      image: null,
    },
  },
  {
    id: "thankyou-banner",
    slotNumber: 8,
    name: "Thank You Banner",
    placement: "order-confirmation",
    position: "below-order-details",
    width: 700,
    height: 150,
    creativeType: "image",
    imageFile: "/ads/ad-08-thankyou-banner.png",
    campaign: {
      eyebrow: "",
      headline: "Loved your order?",
      subtext: "",
      ctaText: "Refer & Earn R500",
      ctaLink: "/partners#refer",
      image: null,
    },
  },
];

export function adSlot(id: string) {
  const slot = AD_SLOTS.find((s) => s.id === id);
  if (!slot) throw new Error(`Unknown ad slot ${id}`);
  return slot;
}

/** Slot 5 is computed from the live query. A generic search keeps the designed PNG. */
export function searchBanner(q: string): AdSlot {
  const base = adSlot("search-banner");
  const intel = applyQueryIntel({ q });
  const cat = intel.category ? CATEGORY_BY_SLUG[intel.category] : undefined;
  if (cat) {
    return {
      ...base,
      creativeType: "html",
      imageFile: undefined,
      campaign: {
        eyebrow: "Matched to your search",
        headline: cat.name,
        subtext: cat.blurb,
        ctaText: `Shop ${cat.name}`,
        ctaLink: `/shop/${cat.slug}`,
        image: cat.family === "hard-landscaping" ? "/images/hero/driveway.jpg" : "/images/bricks/autumn-red.jpg",
      },
    };
  }
  if (intel.family === "hard-landscaping") {
    return {
      ...base,
      creativeType: "html",
      imageFile: undefined,
      campaign: {
        eyebrow: "Matched to your search",
        headline: "Pavers, cobbles and slabs",
        subtext: "Hard landscaping in the same colourways as the facing range.",
        ctaText: "Shop hard landscaping",
        ctaLink: "/shop/clay-pavers",
        image: "/images/hero/driveway.jpg",
      },
    };
  }
  return base;
}

/** Slot 6 follows the SKU’s family, not one global bundle. */
export function crossSellBanner(categorySlug: string): AdSlot {
  const base = adSlot("product-crosssell");
  const cat = CATEGORY_BY_SLUG[categorySlug];
  if (!cat) return base;
  if (cat.family === "hard-landscaping") return base;
  if (cat.family === "clay-masonry") {
    return {
      ...base,
      campaign: {
        eyebrow: "Colour match",
        headline: "Take the same colour to the ground.",
        subtext: "Face, semi-face and clay paver fired as one colourway.",
        ctaText: "See the collection",
        ctaLink: "/collections",
        image: "/images/hero/colour-match.jpg",
      },
    };
  }
  if (categorySlug === "braai-kits") {
    return {
      ...base,
      campaign: {
        eyebrow: "Complete the braai",
        headline: "Firebrick, grate and flue with the kit.",
        subtext: "Don’t leave the sundries for a second delivery.",
        ctaText: "Shop sundries",
        ctaLink: "/shop/mortar-accessories",
        image: "/images/types/braai.jpg",
      },
    };
  }
  return {
    ...base,
    campaign: {
      eyebrow: "With the structure",
      headline: "Lintels, mortar and accessories",
      subtext: "Specified with the block, not remembered after the truck has left.",
      ctaText: "Shop accessories",
      ctaLink: "/shop/mortar-accessories",
      image: "/images/types/blocks.jpg",
    },
  };
}
