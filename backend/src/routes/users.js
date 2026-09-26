import express from "express";
import bcrypt from "bcrypt";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Every route below requires a valid login AND the Admin role —
// matches "restrict access to modules according to user roles"
// from your requirements doc, now enforced server-side (not just
// hidden in the sidebar like the frontend-only version).
router.use(requireAuth, requireRole("Admin"));

router.get("/", async (req, res) => {
  const result = await query(
    "SELECT id, name, username, role, active, created_at FROM users ORDER BY id"
  );
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name, username, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10); // 10 = bcrypt's standard cost factor
  try {
    const result = await query(
      `INSERT INTO users (name, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, username, role, active`,
      [name, username, passwordHash, role]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") { // Postgres unique_violation
      return res.status(409).json({ success: false, message: "That username is already taken" });
    }
    res.status(500).json({ success: false, message: "Could not create user" });
  }
});

router.patch("/:id", async (req, res) => {
  const { active, role } = req.body;
  const fields = [];
  const values = [];
  let i = 1;

  if (active !== undefined) { fields.push(`active = $${i++}`); values.push(active); }
  if (role !== undefined) { fields.push(`role = $${i++}`); values.push(role); }

  if (fields.length === 0) return res.status(400).json({ success: false, message: "Nothing to update" });

  values.push(req.params.id);
  await query(`UPDATE users SET ${fields.join(", ")} WHERE id = $${i}`, values);
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await query("DELETE FROM users WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

export default router;
