import { useEffect, useState } from "react";
import { getReportsData } from "../api/api";
import PageBanner from "../components/PageBanner";

const TABS = ["Overview", "Best Selling", "Low Stock", "Outstanding Payments"];

function Reports() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(TABS[0]);

  useEffect(() => {
    getReportsData().then(setData);
  }, []);

  if (!data) return <p>Loading reports...</p>;

  return (
    <div>
      <PageBanner title="Reports & Analytics" subtitle="Sales, stock, and financial performance at a glance" />

      <ul className="nav nav-tabs mb-3">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button
              className={`nav-link ${tab === t ? "active" : ""}`}
              style={tab === t ? { color: "var(--plum)", fontWeight: 700 } : {}}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>

      {tab === "Overview" && (
        <div className="row g-3">
          <StatCard label="Total Revenue" value={`$${data.revenue.toFixed(2)}`} />
          <StatCard label="Total Expenses" value={`$${data.totalExpenses.toFixed(2)}`} />
          <StatCard label="Gross Profit" value={`$${data.grossProfit.toFixed(2)}`} warning={data.grossProfit < 0} />
          <StatCard label="Completed Sales" value={data.salesCount} />
        </div>
      )}

      {tab === "Best Selling" && (
        <table className="table table-hover bg-white shadow-sm">
          <thead><tr><th>Part</th><th>Units Sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {data.bestSelling.length === 0 && (
              <tr><td colSpan={3} className="text-muted">No sales yet.</td></tr>
            )}
            {data.bestSelling.map((p) => (
              <tr key={p.name}><td>{p.name}</td><td>{p.qty}</td><td>${p.revenue.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "Low Stock" && (
        <table className="table table-hover bg-white shadow-sm">
          <thead><tr><th>Part</th><th>Current Stock</th><th>Reorder Level</th></tr></thead>
          <tbody>
            {data.lowStock.length === 0 && (
              <tr><td colSpan={3} className="text-muted">Nothing below reorder level.</td></tr>
            )}
            {data.lowStock.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><span className={`badge ${p.quantity === 0 ? "bg-danger" : "bg-warning text-dark"}`}>{p.quantity}</span></td>
                <td>{p.reorderLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "Outstanding Payments" && (
        <table className="table table-hover bg-white shadow-sm">
          <thead><tr><th>Customer</th><th>Balance Owed</th></tr></thead>
          <tbody>
            {data.outstandingPayments.length === 0 && (
              <tr><td colSpan={2} className="text-muted">No outstanding balances.</td></tr>
            )}
            {data.outstandingPayments.map((c) => (
              <tr key={c.id}><td>{c.name}</td><td>${c.balanceOwed.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value, warning }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card shadow-sm text-center p-3">
        <div className="text-muted small">{label}</div>
        <div className="fs-4 fw-bold" style={{ color: warning ? "var(--rose-dark)" : "var(--plum)" }}>{value}</div>
      </div>
    </div>
  );
}

export default Reports;
