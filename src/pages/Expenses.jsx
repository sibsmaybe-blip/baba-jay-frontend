import { useEffect, useState } from "react";
import { getExpenses, createExpense } from "../api/api";
import { EXPENSE_CATEGORIES } from "../data/mockExpenses";
import PageBanner from "../components/PageBanner";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: EXPENSE_CATEGORIES[0], amount: "", description: "" });

  async function load() {
    setExpenses(await getExpenses());
  }

  useEffect(() => {
    load();
  }, []);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  async function handleAdd(e) {
    e.preventDefault();
    await createExpense({ ...form, amount: parseFloat(form.amount) });
    setForm({ category: EXPENSE_CATEGORIES[0], amount: "", description: "" });
    setShowForm(false);
    load();
  }

  return (
    <div>
      <PageBanner title="Expenses" subtitle="Track business costs by category" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      <div className="card p-3 mb-3 shadow-sm" style={{ maxWidth: "260px" }}>
        <div className="text-muted small">Total Expenses</div>
        <div className="fs-4 fw-bold" style={{ color: "var(--rose-dark)" }}>${total.toFixed(2)}</div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-3 mb-4 shadow-sm">
          <div className="row g-2">
            <div className="col-md-3">
              <select className="form-select" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" step="0.01" className="form-control" placeholder="Amount"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="col-md-5">
              <input className="form-control" placeholder="Description"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Save</button>
            </div>
          </div>
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td><span className="badge" style={{ background: "var(--bubblegum)" }}>{e.category}</span></td>
              <td>{e.description}</td>
              <td>${e.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Expenses;
