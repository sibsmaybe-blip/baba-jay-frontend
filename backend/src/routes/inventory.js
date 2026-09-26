import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { logStockMovement, partToFrontendShape } from "../utils.js";

const router = express.Router();
router.use(requireAuth);

router.get("/low-stock", async (req, res) => {
  const result = await query("SELECT * FROM parts WHERE quantity <= reorder_level ORDER BY quantity");
  res.json(result.rows.map(partToFrontendShape));
});

router.post("/adjust", async (req, res) => {
  const { partId, quantityChange, reason, performedBy } = req.body;
  const partResult = await query("SELECT * FROM parts WHERE id = $1", [partId]);
  const part = partResult.rows[0];
  if (!part) return res.status(404).json({ success: false, message: "Part not found" });

  const newQuantity = part.quantity + quantityChange;
  await query("UPDATE parts SET quantity = $1 WHERE id = $2", [newQuantity, partId]);

  await logStockMovement({
    partId,
    partName: part.name,
    change: quantityChange,
    type: quantityChange >= 0 ? "increase" : "decrease",
    reason,
    performedBy,
  });

  res.json({ success: true, newQuantity });
});

export default router;
