// Mock user accounts. In Phase 7, this whole file disappears —
// the backend + database becomes the source of truth for users.
// Passwords are plain text here ONLY because it's a local mock;
// a real backend must hash passwords (bcrypt) and never store them
// in the frontend at all.

export const mockUsers = [
  { id: 1, name: "Yvette", username: "yvette", password: "admin123", role: "Admin", active: true },
  { id: 2, name: "Tanaka", username: "tanaka", password: "sales123", role: "Salesperson", active: true },
  { id: 3, name: "Rudo", username: "rudo", password: "stock123", role: "StockManager", active: true },
  { id: 4, name: "Blessing", username: "blessing", password: "cash123", role: "Cashier", active: false },
];

export const ROLES = ["Admin", "Salesperson", "StockManager", "Cashier"];
