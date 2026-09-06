import { useEffect, useState } from "react";
import { getParts, adjustStock } from "../api/api";
import { mockStockMovements } from "../data/mockParts";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import PageBanner from "../components/PageBanner";

function Inventory() {
  const [parts, setParts] = useState([]);
  const [adjustingId, setAdjustingId] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const { currentUser } = useAuth();

  async function loadParts() {
    setParts(await getParts());
  }

  useEffect(() => {
    loadParts();
  }, []);

  const lowStock = parts.filter((p) => p.quantity > 0 && p.quantity <= p.reorderLevel);
  const outOfStock = parts.filter((p) => p.quantity === 0);

  async function handleAdjust(part) {
    const change = parseInt(amount, 10);
    if (isNaN(change) || change === 0 || !reason) {
      alert("Enter a non-zero amount and a reason for the adjustment.");
      return;
    }
    await adjustStock(part.id, change, reason, currentUser.name);
    setAdjustingId(null);
    setAmount("");
    setReason("");
    loadParts();
  }

  return (
    <div>
      <PageBanner title="Inventory" subtitle="Stock levels, adjustments, and reorder alerts" />

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="row g-3 mb-4">
          {outOfStock.length > 0 && (
            <div className="col-md-6">
              <Alert type="danger">
                <strong>{outOfStock.length} part(s) out of stock:</strong>{" "}
                {outOfStock.map((p) => p.name).join(", ")}
              </Alert>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="col-md-6">
              <Alert type="warning">
                <strong>{lowStock.length} part(s) below reorder level:</strong>{" "}
                {lowStock.map((p) => p.name).join(", ")}
              </Alert>
            </div>
          )}
        </div>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr>
            <th>Part</th>
            <th>Location</th>
            <th>Current Stock</th>
            <th>Reorder Level</th>
            <th style={{ width: "280px" }}>Adjust Stock</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id}>
              <td>{part.name}</td>
              <td className="text-muted small">{part.location}</td>
              <td>
                <span className={`badge ${part.quantity === 0 ? "bg-danger" : part.quantity <= part.reorderLevel ? "bg-warning text-dark" : "bg-success"}`}>
                  {part.quantity}
                </span>
              </td>
              <td>{part.reorderLevel}</td>
              <td>
                {adjustingId === part.id ? (
                  <div className="d-flex gap-1">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="+/- qty"
                      style={{ width: "80px" }}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                      className="form-control form-control-sm"
                      placeholder="Reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <button className="btn btn-sm btn-primary" onClick={() => handleAdjust(part)}>✓</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setAdjustingId(null)}>✕</button>
                  </div>
                ) : (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setAdjustingId(part.id)}>
                    Adjust
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 style={{ color: "var(--plum)" }} className="mt-4">Recent Stock Movements</h5>
      <ul className="list-group">
        {mockStockMovements.slice(0, 8).map((m) => (
          <li key={m.id} className="list-group-item d-flex justify-content-between small">
            <span>{m.partName} — {m.reason} ({m.performedBy})</span>
            <span className={m.change >= 0 ? "text-success" : "text-danger"}>
              {m.change >= 0 ? "+" : ""}{m.change}
            </span>
          </li>
        ))}
        {mockStockMovements.length === 0 && (
          <li className="list-group-item text-muted">No stock movements yet.</li>
        )}
      </ul>
    </div>
  );
}

export default Inventory;
