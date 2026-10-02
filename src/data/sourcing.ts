export type SourcingBody = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  proof: string;
  claim: string;
  logo: string;
  source: string;
  sourceLabel: string;
  /** White artwork that only reads on the kiln ground. */
  onDark?: boolean;
};

export const SOURCING_BODIES: SourcingBody[] = [
  {
    id: "sabs",
    name: "SABS",
    eyebrow: "National standards and certification",
    description: "SABS develops South African National Standards and provides product testing and certification.",
    proof: "A product certificate, permit or test report matched to the exact product and scope.",
    claim: "A SABS claim is shown only when the partner supplies current, product-specific evidence.",
    logo: "/brand/sourcing/sabs_logo_official.png",
    source: "https://www.sabs.co.za/",
    sourceLabel: "Visit SABS",
  },
  {
    id: "cma",
    name: "CMA / CMACS",
    eyebrow: "Precast concrete",
    description: "The Concrete Manufacturers Association represents the precast industry. CMACS is its separate product-certification service.",
    proof: "Manufacturer membership, or a current CMACS mark for the product range.",
    claim: "Membership is not presented as product certification. The two are labelled separately.",
    logo: "/brand/sourcing/cma_logo_official.jpg",
    source: "https://www.cma.org.za/",
    sourceLabel: "Visit CMA",
  },
  {
    id: "cba",
    name: "Clay Brick Association",
    eyebrow: "Clay brick and pavers",
    description: "The association represents clay brick and paver manufacturers across Southern Africa and publishes technical guidance.",
    proof: "Manufacturer association status, product classification and technical documentation.",
    claim: "An association reference is not a blanket certification of every product sold through Bricksplaza.",
    logo: "/brand/sourcing/clay_brick_association_logo_official.webp",
    source: "https://claybrick.org/",
    sourceLabel: "Visit Clay Brick",
  },
  {
    id: "agrement",
    name: "Agrément South Africa",
    eyebrow: "Innovative construction products",
    description: "Agrément evaluates fitness for purpose of non-standardised construction products, materials and systems.",
    proof: "An active certificate number and the exact scope of that certificate.",
    claim: "Shown only on products covered by an active certificate — not as a storewide mark.",
    logo: "/brand/sourcing/agrement_south_africa_logo.png",
    source: "https://agrement.co.za/certification-process/",
    sourceLabel: "Visit Agrément",
  },
  {
    id: "sanas",
    name: "SANAS",
    eyebrow: "Accreditation",
    description: "SANAS is the national accreditation system behind accredited conformity-assessment bodies.",
    proof: "The accredited body, its scope and the certificate — not a generic SANAS logo on a product.",
    claim: "SANAS is part of the verification chain. It is not a Bricksplaza certification.",
    logo: "/brand/sourcing/sanas_logo.png",
    source: "https://www.sanas.co.za/",
    sourceLabel: "Visit SANAS",
  },
  {
    id: "bbbee",
    name: "B-BBEE Commission",
    eyebrow: "Supplier and ownership",
    description: "B-BBEE evidence can matter to trade, tender and supplier decisions. It is separate from product quality.",
    proof: "A current certificate or affidavit, the issuing body and the validity period for that legal entity.",
    claim: "A B-BBEE level is never described as a certificate of product performance.",
    logo: "/brand/sourcing/bbbee_commission_logo.png",
    source: "https://www.bbbeecommission.co.za/",
    sourceLabel: "Visit the Commission",
  },
  {
    id: "nhbrc",
    name: "NHBRC",
    eyebrow: "Home-builder registration",
    description: "NHBRC registration applies to businesses that build homes. It does not apply to every materials retailer.",
    proof: "Registration evidence only when Bricksplaza or a service partner is doing regulated home-building work.",
    claim: "Shown here so the limit is clear. It is not a generic building-material badge.",
    logo: "/brand/sourcing/nhbrc_logo.svg",
    source: "https://www.nhbrc.org.za/registration-process/",
    sourceLabel: "Visit NHBRC",
    onDark: true,
  },
  {
    id: "cidb",
    name: "cidb",
    eyebrow: "Contractor registration",
    description: "cidb grading applies to contractors and public-sector construction work, not to a product catalogue.",
    proof: "Registration and grading where a service partner is acting as the contractor.",
    claim: "A contractor’s registration is not borrowed to sell materials.",
    logo: "/brand/sourcing/cidb_logo.svg",
    source: "https://www.cidb.org.za/contractors/",
    sourceLabel: "Visit cidb",
    onDark: true,
  },
];

export const SOURCING_STEPS = [
  ["01", "Screen the partner", "Legal identity, where they operate, which product families they make, and who answers for technical support."],
  ["02", "Check the evidence", "Current certificates, datasheets, test reports, standards references, warranties and association status where it applies."],
  ["03", "Map the scope", "Every claim is tied to one manufacturer, product, variant, facility, certificate number and validity period. No blanket claims."],
  ["04", "Publish with context", "Say what the evidence means, link the source where we can, and tell the buyer what they can ask for."],
] as const;

export const SOURCING_REGISTER = [
  { id: "sabs", document: "Product certificate or test report", scope: "Exact product and variant", status: "Requested from the partner" },
  { id: "cma", document: "Membership or CMACS certification", scope: "Precast concrete range", status: "Scope still to be checked" },
  { id: "cba", document: "Association or technical reference", scope: "Clay brick and paver families", status: "Partner evidence" },
  { id: "agrement", document: "Agrément certificate", scope: "Innovative product or system only", status: "Certificate number required" },
  { id: "sanas", document: "Accredited-body scope", scope: "The conformity-assessment body", status: "Trace the certificate issuer" },
  { id: "bbbee", document: "Certificate or affidavit", scope: "The partner’s legal entity", status: "Validity date required" },
  { id: "nhbrc", document: "Builder registration", scope: "Home-building work only", status: "Not a product badge" },
  { id: "cidb", document: "Contractor registration and grading", scope: "The contractor, not the product", status: "Not product approval" },
] as const;

export const SOURCING_PRODUCTS = [
  ["Corobrik face bricks", "Manufacturer evidence", "SANS reference and product datasheet"],
  ["Bosun paving", "Manufacturer evidence", "Test reports and technical datasheet"],
  ["Technicrete blocks", "Manufacturer evidence", "Concrete product classification"],
  ["Infraset roof tiles", "Manufacturer evidence", "Product profile and warranty"],
] as const;

export const SOURCING_QUESTIONS = [
  "Which exact product and variant does the certificate cover?",
  "Who issued the document, and when does it expire?",
  "Is this a test report, a certification, a membership or a registration?",
  "What are the delivery, warranty and return conditions?",
] as const;
