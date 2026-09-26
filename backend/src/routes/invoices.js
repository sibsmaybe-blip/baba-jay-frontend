import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { saleToFrontendShape } from "../utils.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM sales ORDER BY created_at DESC");
  res.json(result.rows.map(saleToFrontendShape));
});

export default router;
