import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// A connection pool, not a single connection — Express handles many
// requests concurrently, and each one borrows a connection from this
// pool for the duration of its query, then returns it. This is the
// standard pattern; a single shared connection would serialize every
// request and become a bottleneck immediately.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

// Small wrapper so every route file can just do: await query("SELECT ...", [params])
// instead of importing pool everywhere and managing client checkout/release itself.
export async function query(text, params) {
  return pool.query(text, params);
}
