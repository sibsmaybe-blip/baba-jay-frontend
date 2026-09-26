import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { partToFrontendShape } from "../utils.js";

const router = express.Router();
router.use(requireAuth); // any logged-in role can view/use parts

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM parts ORDER BY name");
  res.json(result.rows.map(partToFrontendShape));
});

router.post("/", async (req, res) => {
  const { sku, barcode, name, category, brand, price, oemNumber, location, crossRef, compatibleVehicles } = req.body;
  const result = await query(
    `INSERT INTO parts (sku, barcode, name, category, brand, price, oem_number, location, cross_ref, compatible_vehicles)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [sku, barcode || null, name, category, brand, price, oemNumber, location, JSON.stringify(crossRef || []), JSON.stringify(compatibleVehicles || [])]
  );
  res.json({ success: true, part: partToFrontendShape(result.rows[0]) });
});

router.patch("/:id", async (req, res) => {
  const allowed = ["sku", "barcode", "name", "category", "brand", "price", "quantity", "reorder_level", "oem_number", "location"];
  const fields = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = $${i++}`);
      values.push(req.body[key]);
    }
  }
  if (fields.length === 0) return res.status(400).json({ success: false });
  values.push(req.params.id);
  await query(`UPDATE parts SET ${fields.join(", ")} WHERE id = $${i}`, values);
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await query("DELETE FROM parts WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});


export default router;
