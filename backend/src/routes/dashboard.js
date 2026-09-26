import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/stats", async (req, res) => {
  const totalResult = await query("SELECT COALESCE(SUM(total), 0) AS total FROM sales");
  const todayResult = await query(
    "SELECT COALESCE(SUM(total), 0) AS total FROM sales WHERE created_at >= CURRENT_DATE"
  );
  const stockResult = await query("SELECT COALESCE(SUM(quantity), 0) AS total FROM parts");
  const lowStockResult = await query(
    "SELECT COUNT(*) FROM parts WHERE quantity > 0 AND quantity <= reorder_level"
  );
  const outOfStockResult = await query("SELECT COUNT(*) FROM parts WHERE quantity = 0");

  res.json({
    totalSales: parseFloat(totalResult.rows[0].total),
    todaySales: parseFloat(todayResult.rows[0].total),
    productsInStock: parseInt(stockResult.rows[0].total, 10),
    lowStockCount: parseInt(lowStockResult.rows[0].count, 10),
    outOfStockCount: parseInt(outOfStockResult.rows[0].count, 10),
  });
});

export default router;
