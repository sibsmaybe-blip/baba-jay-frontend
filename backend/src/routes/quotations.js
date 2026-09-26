import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { createSaleTransaction, saleToFrontendShape } from "../utils.js";

const router = express.Router();
router.use(requireAuth);

function toFrontendShape(row) {
  return {
    id: row.id,
    customer: row.customer,
    items: row.items,
    total: parseFloat(row.total),
    status: row.status,
    date: row.created_at.toISOString().slice(0, 10),
  };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM quotations ORDER BY created_at DESC");
  res.json(result.rows.map(toFrontendShape));
});

router.post("/", async (req, res) => {
  const { customer, items } = req.body;
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const countResult = await query("SELECT COUNT(*) FROM quotations");
  const id = `QUO-${1000 + parseInt(countResult.rows[0].count, 10) + 1}`;
  const result = await query(
    `INSERT INTO quotations (id, customer, items, total) VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, customer, JSON.stringify(items), total]
  );
  res.json({ success: true, quotation: toFrontendShape(result.rows[0]) });
});

router.post("/:id/convert", async (req, res) => {
  const { paymentMethod } = req.body;
  const quoResult = await query("SELECT * FROM quotations WHERE id = $1", [req.params.id]);
  const quo = quoResult.rows[0];
  if (!quo || quo.status === "Converted") {
    return res.status(400).json({ success: false, message: "Quotation not found or already converted" });
  }

  // Reuses the exact same atomic sale logic as a direct POS sale —
  // converting a quote is just "ring it up now" from stored items.
  const result = await createSaleTransaction({
    items: quo.items,
    customer: quo.customer,
    paymentMethod,
    discount: 0,
    cashTendered: parseFloat(quo.total),
    performedBy: req.user.name,
  });

  if (!result.success) return res.status(400).json({ success: false, message: result.message });

  await query("UPDATE quotations SET status = 'Converted' WHERE id = $1", [quo.id]);
  res.json({ success: true, invoice: saleToFrontendShape(result.row) });
});

export default router;
