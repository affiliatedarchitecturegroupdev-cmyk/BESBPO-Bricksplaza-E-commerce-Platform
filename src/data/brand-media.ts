/** Manufacturer photographs and marks for the four quote-only shops.
 * The Corobrik wordmark in the source pack was misspelled, so only the site brick mark is used. */

export type BrandShot = { src: string; alt: string };

export const BRAND_MEDIA: Record<string, { name: string; logo: string; logoAlt: string; hero: BrandShot; hero2?: BrandShot }> = {
  corobrik: {
    name: "Corobrik",
    logo: "/brand/shops/corobrik/mark.png",
    logoAlt: "Corobrik brick mark",
    hero: { src: "/brand/shops/corobrik/hero.jpg", alt: "Corobrik face brick on a finished wall" },
    hero2: { src: "/brand/shops/corobrik/paving-laid.jpg", alt: "Clay pavers laid in a Corobrik range photograph" },
  },
  bosun: {
    name: "Bosun",
    logo: "/brand/shops/bosun/logo.jpg",
    logoAlt: "Bosun Brick",
    hero: { src: "/brand/shops/bosun/hero.jpg", alt: "Bosun paving installed at a commercial entrance" },
    hero2: { src: "/brand/shops/bosun/retaining.jpg", alt: "Bosun retaining wall blocks installed" },
  },
  technicrete: {
    name: "Technicrete",
    logo: "/brand/shops/technicrete/logo.png",
    logoAlt: "Technicrete",
    hero: { src: "/brand/shops/technicrete/hero-road.jpg", alt: "Technicrete kerbs along a highway" },
    hero2: { src: "/brand/shops/technicrete/hero-wall.jpg", alt: "Planted precast retaining wall from the Technicrete site" },
  },
  infraset: {
    name: "Infraset",
    logo: "/brand/shops/infraset/logo.png",
    logoAlt: "Infraset",
    hero: { src: "/brand/shops/infraset/hero-roof.jpg", alt: "Hip roofs in concrete tile" },
    hero2: { src: "/brand/shops/infraset/hero-pavers.jpg", alt: "Infraset precast pavers" },
  },
};

/** Range photograph. Not a size, a colour match, or a stock claim. */
export const BRAND_FAMILY_IMAGE: Record<string, BrandShot> = {
  "BP-CB-0001": { src: "/brand/shops/corobrik/face-wall.jpg", alt: "Clay face brick wall" },
  "BP-CB-0004": { src: "/brand/shops/corobrik/clay-paver.jpg", alt: "Clay paver texture from the Corobrik paving page" },
  "BP-BS-0001": { src: "/brand/shops/bosun/designer.jpg", alt: "Bosun designer paving" },
  "BP-BS-0002": { src: "/brand/shops/bosun/kerbs.jpg", alt: "Bosun kerbs" },
  "BP-BS-0003": { src: "/brand/shops/bosun/retaining.jpg", alt: "Bosun retaining wall blocks" },
  "BP-TC-0001": { src: "/brand/shops/technicrete/driveway.jpg", alt: "Residential driveway paved with Technicrete pavers" },
  "BP-TC-0007": { src: "/brand/shops/technicrete/mining-bags.jpg", alt: "Technicrete Drycrete and Technimix bags" },
  "BP-IF-0002": { src: "/brand/shops/infraset/horizon.jpg", alt: "Horizon concrete shingle tile, as shown by Infraset" },
  "BP-IF-0003": { src: "/brand/shops/infraset/sunset.jpg", alt: "Sunset Double Roman tile on a roof" },
  "BP-IF-0004": { src: "/brand/shops/infraset/vintage.jpg", alt: "Vintage multi-blend roof tiles" },
  "BP-IF-0005": { src: "/brand/shops/infraset/hero-pavers.jpg", alt: "Infraset paving" },
  "BP-IF-0006": { src: "/brand/shops/infraset/infrablok-350.jpg", alt: "Infrablok retaining blocks" },
  "BP-IF-0007": { src: "/brand/shops/infraset/eco-link.jpg", alt: "Eco-Link erosion mattress" },
};

export const BRAND_SKU_IMAGE: Record<string, BrandShot> = {
  "BP-CB-1001": { src: "/brand/shops/corobrik/wall/081.jpg", alt: "Titanium Satin face brick" },
  "BP-CB-1005": { src: "/brand/shops/corobrik/wall/075.jpg", alt: "Silvergrey Travertine face brick" },
  "BP-CB-1006": { src: "/brand/shops/corobrik/wall/001.jpg", alt: "Agate Satin face brick" },
  "BP-CB-1009": { src: "/brand/shops/corobrik/wall/082.jpg", alt: "Titanium Travertine face brick" },
  "BP-CB-1016": { src: "/brand/shops/corobrik/wall/078.jpg", alt: "Terracotta Satin face brick" },
  "BP-CB-1019": { src: "/brand/shops/corobrik/autumn-wheat.jpg", alt: "Autumn Wheat Travertine face brick" },
  "BP-BS-1003": { src: "/brand/shops/bosun/smooth-ethnic.jpg", alt: "Smooth Ethnic pavers on a driveway" },
  "BP-BS-1011": { src: "/brand/shops/bosun/interlock-80.jpg", alt: "80 mm interlocking pavers outside a warehouse" },
  "BP-BS-1012": { src: "/brand/shops/bosun/figure-3.jpg", alt: "Figure 3 kerb drawing" },
  "BP-BS-1013": { src: "/brand/shops/bosun/figure-4.jpg", alt: "Figure 4 kerb drawing" },
  "BP-BS-1014": { src: "/brand/shops/bosun/figure-7.jpg", alt: "Figure 7 kerb drawing" },
  "BP-BS-1019": { src: "/brand/shops/bosun/bevel-bond.jpg", alt: "Bevel Bond pavers on a residential driveway" },
  "BP-BS-1020": { src: "/brand/shops/bosun/retaining-rock.jpg", alt: "Bosun Retaining Rock" },
  "BP-IF-1026": { src: "/brand/shops/infraset/bush-stone.jpg", alt: "Bush Stone paving" },
  "BP-IF-1027": { src: "/brand/shops/infraset/cottage-stone.jpg", alt: "Cottage Stone paving" },
  "BP-IF-1028": { src: "/brand/shops/infraset/masonique.jpg", alt: "Masonique paving" },
  "BP-IF-1029": { src: "/brand/shops/infraset/infrablok-350.jpg", alt: "Infrablok 350" },
  "BP-IF-1030": { src: "/brand/shops/infraset/infrablok-425.jpg", alt: "Infrablok 425" },
  "BP-IF-1031": { src: "/brand/shops/infraset/loffelstein.jpg", alt: "Löffelstein retaining wall" },
  "BP-IF-1032": { src: "/brand/shops/infraset/ridgeblok.jpg", alt: "Ridgeblok" },
  "BP-IF-1033": { src: "/brand/shops/infraset/eco-link.jpg", alt: "Eco-Link" },
  "BP-IF-1034": { src: "/brand/shops/infraset/infralok-150.jpg", alt: "Infralok 150" },
  "BP-IF-1035": { src: "/brand/shops/infraset/geo-link.jpg", alt: "Geo-Link" },
};
