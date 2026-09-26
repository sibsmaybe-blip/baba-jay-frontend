import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  const result = await query("SELECT * FROM users WHERE username = $1", [username]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }
  if (!user.active) {
    return res.status(403).json({ success: false, message: "This account has been deactivated" });
  }

  // bcrypt.compare hashes the entered password with the SAME salt stored
  // in password_hash and checks if they match — the real password is
  // never stored anywhere, so even a database leak doesn't expose it.
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "8h" } // matches a typical shift length
  );

  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, username: user.username, role: user.role },
  });
});

export default router;
