// Run with: npm run db:migrate
// Reads schema.sql and executes it against whatever DATABASE_URL
// points to. Safe to run once on a fresh database; running it again
// on a database that already has these tables will error (tables
// already exist) — that's expected, not a bug.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf-8");
  try {
    await pool.query(schema);
    console.log("✓ Schema applied successfully.");
  } catch (err) {
    console.error("✗ Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
