import express from "express";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth, requireRole("Admin"));

router.get("/summary", async (req, res) => {
  const revenueResult = await query("SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS count FROM sales");
  const expensesResult = await query("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses");
  const salesResult = await query("SELECT items FROM sales");
  const lowStockResult = await query("SELECT * FROM parts WHERE quantity <= reorder_level");
  const outstandingResult = await query("SELECT * FROM customers WHERE balance_owed > 0");

  const revenue = parseFloat(revenueResult.rows[0].revenue);
  const totalExpenses = parseFloat(expensesResult.rows[0].total);

  // Aggregate quantity/revenue per product across every sale's line items
  const salesByProduct = {};
  for (const sale of salesResult.rows) {
    for (const item of sale.items) {
      if (!salesByProduct[item.name]) salesByProduct[item.name] = { name: item.name, qty: 0, revenue: 0 };
      salesByProduct[item.name].qty += item.qty;
      salesByProduct[item.name].revenue += item.price * item.qty;
    }
  }
  const bestSelling = Object.values(salesByProduct).sort((a, b) => b.qty - a.qty);

  res.json({
    revenue,
    totalExpenses,
    grossProfit: revenue - totalExpenses,
    salesCount: parseInt(revenueResult.rows[0].count, 10),
    bestSelling,
    lowStock: lowStockResult.rows.map((p) => ({
      id: p.id, name: p.name, quantity: p.quantity, reorderLevel: p.reorder_level,
    })),
    outstandingPayments: outstandingResult.rows.map((c) => ({
      id: c.id, name: c.name, balanceOwed: parseFloat(c.balance_owed),
    })),
  });
});

export default router;
