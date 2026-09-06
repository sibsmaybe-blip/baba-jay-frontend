// Mock data stands in for real API responses until Phase 7 (real backend).
// Keep the shape realistic now so swapping to real data later is painless.

export const mockDashboardStats = {
  totalSales: 48250.0,
  todaySales: 1320.5,
  productsInStock: 842,
  lowStockCount: 6,
  outOfStockCount: 2,
};

export const mockLowStockParts = [
  { id: 1, name: "Brake Pads (Toyota Corolla)", quantity: 3, reorderLevel: 10 },
  { id: 2, name: "Oil Filter (Honda Fit)", quantity: 1, reorderLevel: 8 },
  { id: 3, name: "Air Filter (Nissan Hardbody)", quantity: 0, reorderLevel: 5 },
];

export const mockRecentTransactions = [
  { id: "INV-1042", customer: "Tinashe M.", amount: 45.0, method: "EcoCash", date: "2026-09-02" },
  { id: "INV-1041", customer: "Walk-in", amount: 12.5, method: "Cash", date: "2026-09-02" },
  { id: "INV-1040", customer: "Farai Motors", amount: 210.0, method: "Bank Transfer", date: "2026-09-01" },
];
