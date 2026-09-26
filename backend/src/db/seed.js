// Run with: node src/db/seed.js
// Populates the same starting accounts, products, customers, and
// suppliers your frontend mock data uses, so you can log in and test
// against a real database immediately with the same credentials.

import bcrypt from "bcrypt";
import { pool, query } from "../db.js";

async function seed() {
  const users = [
    { name: "Yvette", username: "yvette", password: "admin123", role: "Admin" },
    { name: "Tanaka", username: "tanaka", password: "sales123", role: "Salesperson" },
    { name: "Rudo", username: "rudo", password: "stock123", role: "StockManager" },
    { name: "Blessing", username: "blessing", password: "cash123", role: "Cashier", active: false },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await query(
      `INSERT INTO users (name, username, password_hash, role, active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      [u.name, u.username, hash, u.role, u.active !== false]
    );
  }

  const parts = [
    {
      sku: "BJ-INT-001", barcode: "6001234567890", name: "Wall & All Interior Paint — White",
      category: "Interior Paint", brand: "Plascon", price: 38.0, quantity: 3, reorderLevel: 10,
      oemNumber: "PL-WA-5L-WHT", crossRef: ["Dulux Vinyl Matt White"], location: "Aisle 1, Shelf A",
      surfaces: ["Wall", "Ceiling"],
    },
    {
      sku: "BJ-EXT-014", barcode: "6001234567906", name: "Weatherguard Exterior Paint — Terracotta",
      category: "Exterior Paint", brand: "Dulux", price: 54.5, quantity: 1, reorderLevel: 8,
      oemNumber: "DX-WG-20L-TER", crossRef: ["Plascon Micatex Terracotta"], location: "Aisle 1, Shelf C",
      surfaces: ["Wall", "Concrete", "Brick"],
    },
    {
      sku: "BJ-PRM-022", barcode: "6001234567913", name: "Universal Wood Primer",
      category: "Primer", brand: "Sadolin", price: 22.0, quantity: 0, reorderLevel: 5,
      oemNumber: "SD-UP-1L", crossRef: [], location: "Aisle 2, Shelf A",
      surfaces: ["Wood"],
    },
    {
      sku: "BJ-ENM-005", barcode: "6001234567920", name: "Enamel Gloss Paint — Signal Red",
      category: "Enamel", brand: "Duco", price: 14.75, quantity: 40, reorderLevel: 15,
      oemNumber: "DC-EN-1L-RED", crossRef: [], location: "Aisle 3, Shelf A",
      surfaces: ["Metal", "Wood"],
    },
  ];

  for (const p of parts) {
    await query(
      `INSERT INTO parts (sku, barcode, name, category, brand, price, quantity, reorder_level, oem_number, cross_ref, location, compatible_vehicles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (sku) DO NOTHING`,
      [p.sku, p.barcode, p.name, p.category, p.brand, p.price, p.quantity, p.reorderLevel, p.oemNumber, JSON.stringify(p.crossRef), p.location, JSON.stringify(p.surfaces)]
    );
  }

  const customers = [
    { name: "Tinashe Moyo", phone: "0771 234 567", email: "tinashe@example.com", balanceOwed: 0 },
    { name: "Farai Décor (Contractor)", phone: "0772 555 111", email: "farai.decor@example.com", balanceOwed: 45.0 },
  ];
  for (const c of customers) {
    await query(
      `INSERT INTO customers (name, phone, email, balance_owed) VALUES ($1, $2, $3, $4)`,
      [c.name, c.phone, c.email, c.balanceOwed]
    );
  }

  const suppliers = [
    { name: "ColorWorld Distributors", phone: "0242 700 111", email: "sales@colorworld.co.zw",
      partsSupplied: ["Wall & All Interior Paint", "Weatherguard Exterior Paint"], amountOwed: 320.0 },
    { name: "Harare Paint Wholesalers", phone: "0292 400 222", email: "orders@hararepaint.co.zw",
      partsSupplied: ["Enamel Gloss Paint", "Universal Wood Primer"], amountOwed: 0 },
  ];
  for (const s of suppliers) {
    await query(
      `INSERT INTO suppliers (name, phone, email, parts_supplied, amount_owed) VALUES ($1, $2, $3, $4, $5)`,
      [s.name, s.phone, s.email, JSON.stringify(s.partsSupplied), s.amountOwed]
    );
  }

  console.log("✓ Seed data inserted.");
  await pool.end();
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err.message);
  process.exit(1);
});
