import express from "express";
import { query, pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

function toFrontendShape(row) {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    items: row.items,
    status: row.status,
    date: row.created_at.toISOString().slice(0, 10),
    totalCost: parseFloat(row.total_cost),
  };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM purchases ORDER BY created_at DESC");
  res.json(result.rows.map(toFrontendShape));
});

router.post("/", async (req, res) => {
  const { supplierId, supplierName, items } = req.body;
  const totalCost = items.reduce((sum, i) => sum + i.cost * i.qty, 0);
  const id = `PO-${Date.now()}`;
  const result = await query(
    `INSERT INTO purchases (id, supplier_id, supplier_name, items, status, total_cost)
     VALUES ($1, $2, $3, $4, 'Pending', $5) RETURNING *`,
    [id, supplierId, supplierName, JSON.stringify(items), totalCost]
  );
  res.json({ success: true, po: toFrontendShape(result.rows[0]) });
});

router.post("/:id/receive", async (req, res) => {
  const { performedBy } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const poResult = await client.query("SELECT * FROM purchases WHERE id = $1 FOR UPDATE", [req.params.id]);
    const po = poResult.rows[0];
    if (!po || po.status === "Received") throw new Error("Purchase order not found or already received");

    await client.query("UPDATE purchases SET status = 'Received' WHERE id = $1", [po.id]);

    for (const item of po.items) {
      await client.query("UPDATE parts SET quantity = quantity + $1 WHERE id = $2", [item.qty, item.partId]);
      await client.query(
        `INSERT INTO stock_movements (part_id, part_name, change, type, reason, performed_by)
         VALUES ($1, $2, $3, 'purchase', $4, $5)`,
        [item.partId, item.name, item.qty, `Received ${po.id} from ${po.supplier_name}`, performedBy]
      );
    }

    if (po.supplier_id) {
      await client.query("UPDATE suppliers SET amount_owed = amount_owed + $1 WHERE id = $2", [po.total_cost, po.supplier_id]);
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

export default router;
