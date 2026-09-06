import { useEffect, useState } from "react";
import { getDashboardStats, getLowStockParts, getRecentTransactions } from "../api/api";
import PageBanner from "../components/PageBanner";

// This is the reference pattern for every future module page:
// 1. useState to hold the data
// 2. useEffect to fetch it once when the page loads
// 3. render from state
// Right now the api.js functions return mock data — in Phase 7, only
// api.js changes; this component doesn't need to be touched.
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getLowStockParts().then(setLowStock);
    getRecentTransactions().then(setTransactions);
  }, []); // empty array = run once, when the page first loads

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div>
      <PageBanner title="Dashboard" subtitle="Overview of sales, stock, and recent activity" />

      <div className="row g-3 my-2">
        <StatCard label="Total Sales" value={`$${stats.totalSales.toLocaleString()}`} />
        <StatCard label="Today's Sales" value={`$${stats.todaySales.toLocaleString()}`} />
        <StatCard label="Products in Stock" value={stats.productsInStock} />
        <StatCard
          label="Low / Out of Stock"
          value={`${stats.lowStockCount} / ${stats.outOfStockCount}`}
          warning
        />
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header" style={{ background: "var(--cream)" }}>
              Low Stock Alerts
            </div>
            <ul className="list-group list-group-flush">
              {lowStock.map((part) => (
                <li key={part.id} className="list-group-item d-flex justify-content-between">
                  <span>{part.name}</span>
                  <span className="badge bg-danger">{part.quantity} left</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header" style={{ background: "var(--cream)" }}>
              Recent Transactions
            </div>
            <ul className="list-group list-group-flush">
              {transactions.map((tx) => (
                <li key={tx.id} className="list-group-item d-flex justify-content-between">
                  <span>{tx.id} — {tx.customer}</span>
                  <span>${tx.amount.toFixed(2)} ({tx.method})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, warning }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card shadow-sm text-center p-3">
        <div className="text-muted small">{label}</div>
        <div
          className="fs-4 fw-bold"
          style={{ color: warning ? "var(--rose-dark)" : "var(--plum)" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
