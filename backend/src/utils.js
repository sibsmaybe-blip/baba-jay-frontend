import { query, pool } from "./db.js";

// Every module that changes stock calls this — Sales, Purchasing,
// Returns, and manual Inventory adjustments all write to the same
// table, which is what powers both the Inventory movement log and
// the full Audit page from one shared source of truth.
export async function logStockMovement({ partId, partName, change, type, reason, performedBy }) {
  await query(
    `INSERT INTO stock_movements (part_id, part_name, change, type, reason, performed_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [partId, partName, change, type, reason, performedBy]
  );
}

export function partToFrontendShape(row) {
  return {
    id: row.id,
    sku: row.sku,
    barcode: row.barcode,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price: parseFloat(row.price),
    quantity: row.quantity,
    reorderLevel: row.reorder_level,
    oemNumber: row.oem_number,
    crossRef: row.cross_ref,
    location: row.location,
    compatibleVehicles: row.compatible_vehicles,
  };
}

export function saleToFrontendShape(row) {
  return {
    id: row.id,
    date: row.created_at,
    customer: row.customer,
    items: row.items,
    paymentMethod: row.payment_method,
    subtotal: parseFloat(row.subtotal),
    discount: parseFloat(row.discount),
    total: parseFloat(row.total),
    change: parseFloat(row.change),
  };
}

// Shared by both direct POS sales AND quotation-conversion, so both
// paths get the exact same atomicity guarantee — one code path for
// "money changes hands and stock changes," not two that could drift
// out of sync with each other over time.
export async function createSaleTransaction({ items, customer, paymentMethod, discount, cashTendered, performedBy }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const total = Math.max(0, subtotal - (discount || 0));
    const change = paymentMethod === "Cash" && cashTendered ? Math.max(0, cashTendered - total) : 0;
    const id = `INV-${Date.now()}`;

    for (const item of items) {
      const partResult = await client.query("SELECT * FROM parts WHERE id = $1 FOR UPDATE", [item.id]);
      const part = partResult.rows[0];
      if (!part || part.quantity < item.qty) {
        throw new Error(`Not enough stock for ${item.name}`);
      }
      await client.query("UPDATE parts SET quantity = quantity - $1 WHERE id = $2", [item.qty, item.id]);
      await client.query(
        `INSERT INTO stock_movements (part_id, part_name, change, type, reason, performed_by)
         VALUES ($1, $2, $3, 'sale', 'Sale', $4)`,
        [item.id, item.name, -item.qty, performedBy]
      );
    }

    const saleResult = await client.query(
      `INSERT INTO sales (id, customer, items, payment_method, subtotal, discount, total, change, performed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, customer, JSON.stringify(items), paymentMethod, subtotal, discount || 0, total, change, performedBy]
    );

    await client.query("COMMIT");
    return { success: true, row: saleResult.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
