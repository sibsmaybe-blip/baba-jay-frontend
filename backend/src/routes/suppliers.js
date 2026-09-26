import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

function toFrontendShape(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    partsSupplied: row.parts_supplied,
    amountOwed: parseFloat(row.amount_owed),
  };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM suppliers ORDER BY name");
  res.json(result.rows.map(toFrontendShape));
});

router.post("/", async (req, res) => {
  const { name, phone, email } = req.body;
  const result = await query(
    `INSERT INTO suppliers (name, phone, email) VALUES ($1, $2, $3) RETURNING *`,
    [name, phone, email]
  );
  res.json({ success: true, supplier: toFrontendShape(result.rows[0]) });
});

export default router;
