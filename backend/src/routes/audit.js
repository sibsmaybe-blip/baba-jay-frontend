import express from "express";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth, requireRole("Admin"));

router.get("/movements", async (req, res) => {
  const result = await query("SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 200");
  res.json(
    result.rows.map((m) => ({
      id: m.id,
      partName: m.part_name,
      change: m.change,
      type: m.type,
      reason: m.reason,
      performedBy: m.performed_by,
      date: m.created_at,
    }))
  );
});

export default router;
