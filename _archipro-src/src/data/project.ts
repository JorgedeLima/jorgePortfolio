// Seed data for the ArchiPro application prototype.
// Everything here is invented: people, practice, suppliers, products, prices and dates.
// Prices are in NZD and exclude GST. Product guidance (lead times, maintenance) is invented supplier data.

export type Role = "homeowner" | "architect";

export type ProjectStage =
  | "Researching"
  | "Planning"
  | "Designing"
  | "Approvals"
  | "Construction"
  | "Interiors"
  | "Completion";

export type ItemStatus =
  | "Idea"
  | "Shortlisted"
  | "Sent for review"
  | "Changes requested"
  | "Approved by architect"
  | "Signed off"
  | "Specified"
  | "Ordered";

export type VersionStatus = "Pending signatures" | "Signed" | "Superseded";

export type BriefPriorityId = "villa-character" | "natural-materials" | "low-maintenance";

export interface BriefPriority {
  id: BriefPriorityId;
  label: string;
}

export interface Person {
  id: string;
  name: string;
  firstName: string;
  role: Role;
  practice?: string;
}

export interface Product {
  id: string;
  name: string;
  supplier: string;
  unit: "m²" | "lump sum";
  rate: number;          // NZD per unit
  quantity: number;      // in units
  quantityIsEstimate: boolean;
  total: number;         // NZD, rate x quantity
  leadTimeWeeks: number;
  maintenance: string;   // supplier guidance, shown as such
  matches: BriefPriorityId[];
  conflicts: BriefPriorityId[];
  image: string;         // path under public/images, set once the image set is approved
  alt: string;
}

export interface Note {
  authorId: string;
  at: string;            // ISO date-time
  text: string;
}

export interface Item {
  id: string;
  name: string;
  status: ItemStatus;
  optionIds: string[];   // product ids
  selectedOptionId: string | null;
  needOnSiteBy: string;  // ISO date
  notes: Note[];
}

export interface Signature {
  personId: string;
  role: Role;
  signedAt: string;      // ISO date-time
  statement: string;
}

export interface SignOffVersion {
  number: number;
  status: VersionStatus;
  createdAt: string;
  reason: string | null;     // why this version exists (null for version 1)
  changes: string[];         // what changed from the previous version
  snapshot: { itemId: string; productId: string; total: number }[];
  total: number;
  signatures: Signature[];
}

export interface Package {
  id: string;
  name: string;
  allowance: number;     // NZD
  itemIds: string[];
  versions: SignOffVersion[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  stage: ProjectStage;
  budget: number;        // NZD
  contingency: number;   // NZD, held outside package allowances
  startDate: string;
  brief: { summary: string; priorities: BriefPriority[] };
  people: Person[];
  products: Product[];
  items: Item[];
  packages: Package[];
}

const SIGN_STATEMENT = (version: number, pkg: string) =>
  `I approve version ${version} of the ${pkg} package as listed above.`;

export const project: Project = {
  id: "westmere-villa",
  name: "Westmere villa renovation",
  location: "Westmere, Auckland",
  type: "Residential, home renovation",
  stage: "Designing",
  budget: 420000,
  contingency: 20000,
  startDate: "2027-05-03",
  brief: {
    summary:
      "Renovate a 1910s villa for a family of four. Keep its character, use warm natural materials, and keep maintenance low where possible.",
    priorities: [
      { id: "villa-character", label: "Keep the villa character" },
      { id: "natural-materials", label: "Warm natural materials" },
      { id: "low-maintenance", label: "Low maintenance where possible" },
    ],
  },

  people: [
    { id: "hana", name: "Hana Walker", firstName: "Hana", role: "homeowner" },
    { id: "tom", name: "Tom Leung", firstName: "Tom", role: "architect", practice: "Leung Studio" },
  ],

  products: [
    // Exterior: cladding options (the open decision in the demo)
    {
      id: "cladding-cedar",
      name: "Vertical cedar shiplap, oiled",
      supplier: "Northbank Timber",
      unit: "m²",
      rate: 185,
      quantity: 140,
      quantityIsEstimate: true,
      total: 25900,
      leadTimeWeeks: 6,
      maintenance: "Re-oil every 3 to 5 years",
      matches: ["villa-character", "natural-materials"],
      conflicts: ["low-maintenance"],
      image: "images/cladding-cedar.jpg",
      alt: "Close-up of vertical timber boards in warm brown tones",
    },
    {
      id: "cladding-fibre-cement",
      name: "Fibre cement vertical panel, painted",
      supplier: "Coastline Panels",
      unit: "m²",
      rate: 128,
      quantity: 140,
      quantityIsEstimate: true,
      total: 17920,
      leadTimeWeeks: 3,
      maintenance: "Repaint every 10 to 15 years",
      matches: ["villa-character", "low-maintenance"],
      conflicts: ["natural-materials"],
      image: "images/cladding-fibre-cement.jpg",
      alt: "Grey building facade seen from below",
    },
    // Exterior: already approved
    {
      id: "roofing-steel",
      name: "Corrugated steel roofing, charcoal",
      supplier: "Southfield Roofing",
      unit: "lump sum",
      rate: 21500,
      quantity: 1,
      quantityIsEstimate: false,
      total: 21500,
      leadTimeWeeks: 4,
      maintenance: "Wash exposed areas every 6 months",
      matches: ["villa-character", "low-maintenance"],
      conflicts: [],
      image: "images/roofing-steel.jpg",
      alt: "Close-up of grey ribbed metal sheeting",
    },
    {
      id: "joinery-aluminium",
      name: "Thermally broken aluminium joinery, double glazed",
      supplier: "Clearline Joinery",
      unit: "lump sum",
      rate: 24800,
      quantity: 1,
      quantityIsEstimate: false,
      total: 24800,
      leadTimeWeeks: 10,
      maintenance: "Clean tracks and seals once a year",
      matches: ["low-maintenance"],
      conflicts: [],
      image: "images/joinery-aluminium.jpg",
      alt: "Black-framed window with a view of trees",
    },
    // Bathroom: version history example
    {
      id: "tile-terrazzo",
      name: "Terrazzo floor tile, 600 x 600",
      supplier: "Stoneleaf Tiles",
      unit: "m²",
      rate: 190,
      quantity: 20,
      quantityIsEstimate: false,
      total: 3800,
      leadTimeWeeks: 5,
      maintenance: "Seal once a year",
      matches: ["natural-materials"],
      conflicts: [],
      image: "images/tile-terrazzo.jpg",
      alt: "Geometric floor of marble and stone tiles",
    },
    {
      id: "tile-porcelain-terrazzo",
      name: "Porcelain terrazzo-look floor tile, 600 x 600",
      supplier: "Stoneleaf Tiles",
      unit: "m²",
      rate: 211,
      quantity: 20,
      quantityIsEstimate: false,
      total: 4220,
      leadTimeWeeks: 3,
      maintenance: "No sealing needed",
      matches: ["low-maintenance"],
      conflicts: [],
      image: "images/tile-porcelain.jpg",
      alt: "Sunlight across a pale textured floor",
    },
    {
      id: "tile-wall-white",
      name: "Handmade-look wall tile, 75 x 300, white",
      supplier: "Stoneleaf Tiles",
      unit: "m²",
      rate: 100,
      quantity: 32,
      quantityIsEstimate: false,
      total: 3200,
      leadTimeWeeks: 4,
      maintenance: "Reseal grout every 2 years",
      matches: ["villa-character"],
      conflicts: [],
      image: "images/bathroom.jpg",
      alt: "White bathroom with a freestanding bath and glass shower",
    },
  ],

  items: [
    {
      id: "exterior-cladding",
      name: "Exterior cladding",
      status: "Shortlisted",
      optionIds: ["cladding-cedar", "cladding-fibre-cement"],
      selectedOptionId: null,
      needOnSiteBy: "2027-02-15",
      notes: [],
    },
    {
      id: "exterior-roofing",
      name: "Roofing",
      status: "Approved by architect",
      optionIds: ["roofing-steel"],
      selectedOptionId: "roofing-steel",
      needOnSiteBy: "2027-01-25",
      notes: [{ authorId: "tom", at: "2026-09-18T10:12:00+12:00", text: "Charcoal matches the existing gutters. Approved." }],
    },
    {
      id: "exterior-joinery",
      name: "Window and door joinery",
      status: "Approved by architect",
      optionIds: ["joinery-aluminium"],
      selectedOptionId: "joinery-aluminium",
      needOnSiteBy: "2027-03-01",
      notes: [{ authorId: "tom", at: "2026-09-24T14:40:00+12:00", text: "Approved. Order early, the lead time is 10 weeks." }],
    },
    {
      id: "bathroom-floor",
      name: "Bathroom floor tile",
      status: "Specified",
      optionIds: ["tile-terrazzo", "tile-porcelain-terrazzo"],
      selectedOptionId: "tile-porcelain-terrazzo",
      needOnSiteBy: "2027-06-14",
      notes: [],
    },
    {
      id: "bathroom-wall",
      name: "Bathroom wall tile",
      status: "Specified",
      optionIds: ["tile-wall-white"],
      selectedOptionId: "tile-wall-white",
      needOnSiteBy: "2027-06-14",
      notes: [],
    },
  ],

  packages: [
    {
      id: "exterior",
      name: "Exterior",
      allowance: 68000,
      itemIds: ["exterior-cladding", "exterior-roofing", "exterior-joinery"],
      versions: [
        {
          number: 1,
          status: "Pending signatures",
          createdAt: "2026-09-10T09:00:00+12:00",
          reason: null,
          changes: [],
          snapshot: [], // filled when the version is signed
          total: 0,     // computed from current selections until signed
          signatures: [],
        },
      ],
    },
    {
      id: "bathroom",
      name: "Bathroom",
      allowance: 18000,
      itemIds: ["bathroom-floor", "bathroom-wall"],
      versions: [
        {
          number: 1,
          status: "Superseded",
          createdAt: "2026-08-10T09:00:00+12:00",
          reason: null,
          changes: [],
          snapshot: [
            { itemId: "bathroom-floor", productId: "tile-terrazzo", total: 3800 },
            { itemId: "bathroom-wall", productId: "tile-wall-white", total: 3200 },
          ],
          total: 7000,
          signatures: [
            { personId: "tom", role: "architect", signedAt: "2026-08-13T16:05:00+12:00", statement: SIGN_STATEMENT(1, "Bathroom") },
            { personId: "hana", role: "homeowner", signedAt: "2026-08-14T19:22:00+12:00", statement: SIGN_STATEMENT(1, "Bathroom") },
          ],
        },
        {
          number: 2,
          status: "Signed",
          createdAt: "2026-09-02T11:30:00+12:00",
          reason: "The supplier discontinued the terrazzo floor tile in version 1.",
          changes: [
            "Floor tile changed from Terrazzo floor tile to Porcelain terrazzo-look floor tile, same supplier.",
            "Package total up NZD 420, from NZD 7,000 to NZD 7,420.",
            "Lead time for the floor tile down from 5 weeks to 3 weeks.",
          ],
          snapshot: [
            { itemId: "bathroom-floor", productId: "tile-porcelain-terrazzo", total: 4220 },
            { itemId: "bathroom-wall", productId: "tile-wall-white", total: 3200 },
          ],
          total: 7420,
          signatures: [
            { personId: "tom", role: "architect", signedAt: "2026-09-03T08:47:00+12:00", statement: SIGN_STATEMENT(2, "Bathroom") },
            { personId: "hana", role: "homeowner", signedAt: "2026-09-05T12:10:00+12:00", statement: SIGN_STATEMENT(2, "Bathroom") },
          ],
        },
      ],
    },
  ],
};

export const signStatement = SIGN_STATEMENT;
