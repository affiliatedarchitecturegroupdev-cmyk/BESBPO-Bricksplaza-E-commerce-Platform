export type PitchSlide = {
  key: string;
  chapter: string;
  kicker: string;
  title: string;
  body: string;
  points: [string, string, string];
  cta: string;
  href: string;
  image: string;
  alt: string;
  focus: string;
  credit: string;
};

/** Sales pitch under the homepage photo and the hero ad. Photography is credited stock, not generated art. */
export const PITCH_SLIDES: PitchSlide[] = [
  {
    key: "yard",
    chapter: "The yard",
    kicker: "What Bricksplaza is",
    title: "Every brick. Named, priced, ready to order.",
    body: "Face, stock, pavers, blocks, specials and the lines around them. One catalogue for the house, the estate and the commercial elevation.",
    points: ["2,044 priced SKUs", "21 categories", "Trade 12% · volume 20%"],
    cta: "Open the master catalogue",
    href: "/catalogue",
    image: "/images/pitch/pretoria-drive.jpg",
    alt: "Clay paver driveway in front of a Pretoria house",
    focus: "center",
    credit: "Alexander F Ungerer, Pexels. Pretoria.",
  },
  {
    key: "work",
    chapter: "How we work",
    kicker: "From the specification to the stand",
    title: "Specify it. Price it. Put it on a truck.",
    body: "A house is a SKU and a coverage figure. A site bigger than that is an RFQ. Approved accounts buy on terms. Everyone else pays retail, or sends proof of an EFT.",
    points: ["Collect at Midrand or Cato Ridge", "Freight into all nine provinces", "Stock held until the reference matches"],
    cta: "See where we deliver",
    href: "/delivery-reach",
    image: "/images/pitch/gauteng-house.jpg",
    alt: "Suburban house in Pretoria with a face-brick plinth and a precast boundary",
    focus: "center",
    credit: "Alexander F Ungerer, Pexels. Pretoria.",
  },
  {
    key: "source",
    chapter: "How we source",
    kicker: "Makers, not a single kiln",
    title: "A hundred makers. Four that specify by name.",
    body: "The priced range is drawn from manufacturers across South Africa. When a drawing says Corobrik, Bosun, Technicrete or Infraset, that maker has its own shop. A standard is printed only when the certificate matches the product.",
    points: ["Not an authorised-stockist claim", "SABS, CMA, Clay Brick, Agrément", "Manufacturer shops stay quote-only"],
    cta: "How a supplier is checked",
    href: "/responsible-sourcing",
    image: "/images/pitch/brick-stack.jpg",
    alt: "A stack of red clay bricks",
    focus: "center",
    credit: "Pexels",
  },
  {
    key: "partners",
    chapter: "Partnerships",
    kicker: "Who buys by the load",
    title: "Contractors, developers, and the store that resells.",
    body: "Three programmes off the same catalogue. A named desk. Volume pricing after the account is approved. Credit is vetted — it does not switch on at signup.",
    points: ["Repeat loads for contractors", "Colour matched across an estate", "Wholesale for hardware stores"],
    cta: "Partner programmes",
    href: "/partners",
    image: "/images/pitch/sa-wall.jpg",
    alt: "Face-brick wall with a kettle braai on a South African stand",
    focus: "center",
    credit: "Pexels",
  },
  {
    key: "build",
    chapter: "Build",
    kicker: "Besbpo Group · Affiliated Builders",
    title: "Buy the brick here. Have it built.",
    body: "Affiliated Builders is the group contractor: masonry, concrete, wet trades, roofing and external works. The page is the path from an order to a building contract. It is not a priced tender.",
    points: ["Commercial, industrial, civil, residential", "They assess the site first", "They price their own rates"],
    cta: "The building pitch",
    href: "/divisions/affiliated-builders",
    image: "/images/pitch/build-site.jpg",
    alt: "Site team standing on a concrete deck above a reinforcement cage",
    focus: "center 40%",
    credit: "Unsplash",
  },
  {
    key: "finish",
    chapter: "Finish",
    kicker: "Besbpo Group · Finishes Construction",
    title: "The brick is the start. The finish is the handover.",
    body: "Fifteen disciplines — plaster, paint, floors, ceilings, waterproofing, glazing and the specialist coats. The quote is line-itemised by Finishes Construction, not added to the brick checkout.",
    points: ["Site visit before the rate moves", "Commercial through to residential", "Workmanship warranty where NHBRC applies"],
    cta: "The finishing pitch",
    href: "/divisions/finishes-construction",
    image: "/images/pitch/finish-site.jpg",
    alt: "Interior under renovation, with exposed brick and a worker on a scaffold",
    focus: "center",
    credit: "Unsplash",
  },
];
