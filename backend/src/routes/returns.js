import express from "express";
import { query, pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

function toFrontendShape(row) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    partId: row.part_id,
    partName: row.part_name,
    qty: row.qty,
    reason: row.reason,
    refundAmount: parseFloat(row.refund_amount),
    status: row.status,
    date: row.created_at.toISOString().slice(0, 10),
  };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM returns ORDER BY created_at DESC");
  res.json(result.rows.map(toFrontendShape));
});

router.post("/", async (req, res) => {
  const { invoiceId, partId, qty, reason } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const partResult = await client.query("SELECT * FROM parts WHERE id = $1 FOR UPDATE", [partId]);
    const part = partResult.rows[0];
    if (!part) throw new Error("Part not found");

    const saleResult = await client.query("SELECT items FROM sales WHERE id = $1", [invoiceId]);
    const saleItem = saleResult.rows[0]?.items.find((i) => i.id === partId);
    const refundAmount = saleItem ? saleItem.price * qty : 0;

    await client.query("UPDATE parts SET quantity = quantity + $1 WHERE id = $2", [qty, partId]);
    await client.query(
      `INSERT INTO stock_movements (part_id, part_name, change, type, reason, performed_by)
       VALUES ($1, $2, $3, 'return', $4, $5)`,
      [partId, part.name, qty, `Return — ${reason}`, req.user.name]
    );

    const id = `RET-${Date.now()}`;
    const result = await client.query(
      `INSERT INTO returns (id, invoice_id, part_id, part_name, qty, reason, refund_amount, performed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, invoiceId, partId, part.name, qty, reason, refundAmount, req.user.name]
    );

    await client.query("COMMIT");
    res.json({ success: true, return: toFrontendShape(result.rows[0]) });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

export default router;
