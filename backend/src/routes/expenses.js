import express from "express";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth, requireRole("Admin")); // matches the nav table: Expenses is Admin-only

function toFrontendShape(row) {
  return {
    id: row.id,
    category: row.category,
    amount: parseFloat(row.amount),
    description: row.description,
    date: row.created_at.toISOString().slice(0, 10),
  };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM expenses ORDER BY created_at DESC");
  res.json(result.rows.map(toFrontendShape));
});

router.post("/", async (req, res) => {
  const { category, amount, description } = req.body;
  const result = await query(
    `INSERT INTO expenses (category, amount, description) VALUES ($1, $2, $3) RETURNING *`,
    [category, amount, description]
  );
  res.json({ success: true, expense: toFrontendShape(result.rows[0]) });
});

export default router;
