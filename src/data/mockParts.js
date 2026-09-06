// Mock paint products. Shape mirrors what a real database table for
// products + a related "recommended_surfaces" table would look like.

export const CATEGORIES = ["Interior Paint", "Exterior Paint", "Primer", "Varnish", "Enamel", "Wall Filler"];

export let mockParts = [
  {
    id: 1,
    sku: "BJ-INT-001",
    barcode: "6001234567890",
    name: "Wall & All Interior Paint — White",
    category: "Interior Paint",
    brand: "Plascon",
    price: 38.0,
    quantity: 3,
    reorderLevel: 10,
    oemNumber: "PL-WA-5L-WHT",
    crossRef: ["Dulux Vinyl Matt White"],
    location: "Aisle 1, Shelf A",
    compatibleVehicles: ["Wall", "Ceiling"], // recommended surfaces
  },
  {
    id: 2,
    sku: "BJ-EXT-014",
    barcode: "6001234567906",
    name: "Weatherguard Exterior Paint — Terracotta",
    category: "Exterior Paint",
    brand: "Dulux",
    price: 54.5,
    quantity: 1,
    reorderLevel: 8,
    oemNumber: "DX-WG-20L-TER",
    crossRef: ["Plascon Micatex Terracotta"],
    location: "Aisle 1, Shelf C",
    compatibleVehicles: ["Wall", "Concrete", "Brick"],
  },
  {
    id: 3,
    sku: "BJ-PRM-022",
    barcode: "6001234567913",
    name: "Universal Wood Primer",
    category: "Primer",
    brand: "Sadolin",
    price: 22.0,
    quantity: 0,
    reorderLevel: 5,
    oemNumber: "SD-UP-1L",
    crossRef: [],
    location: "Aisle 2, Shelf A",
    compatibleVehicles: ["Wood"],
  },
  {
    id: 4,
    sku: "BJ-ENM-005",
    barcode: "6001234567920",
    name: "Enamel Gloss Paint — Signal Red",
    category: "Enamel",
    brand: "Duco",
    price: 14.75,
    quantity: 40,
    reorderLevel: 15,
    oemNumber: "DC-EN-1L-RED",
    crossRef: [],
    location: "Aisle 3, Shelf A",
    compatibleVehicles: ["Metal", "Wood"],
  },
];

// Stock movement log — every sale/adjustment/purchase appends here.
// This directly feeds the Phase 6 Audit module.
export let mockStockMovements = [];

export function logStockMovement(entry) {
  mockStockMovements.unshift({ id: Date.now(), date: new Date().toISOString(), ...entry });
}
