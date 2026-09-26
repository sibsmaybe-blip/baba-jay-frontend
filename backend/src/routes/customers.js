import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { saleToFrontendShape } from "../utils.js";

const router = express.Router();
router.use(requireAuth);

function toFrontendShape(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    balanceOwed: parseFloat(row.balance_owed),
  };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM customers ORDER BY name");
  res.json(result.rows.map(toFrontendShape));
});

router.post("/", async (req, res) => {
  const { name, phone, email } = req.body;
  const result = await query(
    `INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING *`,
    [name, phone, email]
  );
  res.json({ success: true, customer: toFrontendShape(result.rows[0]) });
});

router.get("/:name/purchases", async (req, res) => {
  const result = await query(
    "SELECT * FROM sales WHERE customer = $1 ORDER BY created_at DESC",
    [req.params.name]
  );
  res.json(result.rows.map(saleToFrontendShape));
});

export default router;
