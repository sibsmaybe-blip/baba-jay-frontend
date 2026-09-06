import { useEffect, useState } from "react";
import { getStockMovements } from "../api/api";
import PageBanner from "../components/PageBanner";

const TYPES = ["all", "sale", "purchase", "return", "increase", "decrease"];

function Audit() {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getStockMovements().then(setMovements);
  }, []);

  const filtered = filter === "all" ? movements : movements.filter((m) => m.type === filter);

  return (
    <div>
      <PageBanner title="Stock Audit / Transaction History" subtitle="Every stock movement — sales, purchases, returns, and adjustments" />

      <select className="form-select mb-3" style={{ width: "220px" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
        {TYPES.map((t) => <option key={t} value={t}>{t === "all" ? "All movement types" : t}</option>)}
      </select>

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr><th>Date</th><th>Part</th><th>Change</th><th>Type</th><th>Reason</th><th>Performed By</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="text-muted">No stock movements recorded yet.</td></tr>
          )}
          {filtered.map((m) => (
            <tr key={m.id}>
              <td className="small">{new Date(m.date).toLocaleString()}</td>
              <td>{m.partName}</td>
              <td className={m.change >= 0 ? "text-success" : "text-danger"}>
                {m.change >= 0 ? "+" : ""}{m.change}
              </td>
              <td><span className="badge bg-secondary">{m.type}</span></td>
              <td className="small text-muted">{m.reason}</td>
              <td>{m.performedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Audit;
