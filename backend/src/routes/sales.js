import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { saleToFrontendShape, createSaleTransaction } from "../utils.js";

const router = express.Router();
router.use(requireAuth);

router.get("/recent", async (req, res) => {
  const result = await query(
    `SELECT id, customer, total, payment_method, created_at FROM sales ORDER BY created_at DESC LIMIT 5`
  );
  res.json(
    result.rows.map((r) => ({
      id: r.id,
      customer: r.customer,
      amount: parseFloat(r.total),
      method: r.payment_method,
      date: r.created_at,
    }))
  );
});

router.post("/", async (req, res) => {
  const result = await createSaleTransaction({ ...req.body, performedBy: req.body.performedBy || req.user.name });
  if (!result.success) return res.status(400).json({ success: false, message: result.message });
  res.json({ success: true, invoice: saleToFrontendShape(result.row) });
});

export default router;
