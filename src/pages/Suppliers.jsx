import { useEffect, useState } from "react";
import { getSuppliers, createSupplier } from "../api/api";
import PageBanner from "../components/PageBanner";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  async function load() {
    setSuppliers(await getSuppliers());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    await createSupplier(form);
    setForm({ name: "", phone: "", email: "" });
    setShowForm(false);
    load();
  }

  return (
    <div>
      <PageBanner title="Suppliers" subtitle="Contacts and amounts owed" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Supplier"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-3 mb-4 shadow-sm">
          <div className="row g-2">
            <div className="col-md-4">
              <input className="form-control" placeholder="Supplier name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Save</button>
            </div>
          </div>
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr><th>Supplier</th><th>Phone</th><th>Email</th><th>Parts Supplied</th><th>Amount Owed</th></tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.phone}</td>
              <td>{s.email}</td>
              <td className="small text-muted">{s.partsSupplied.join(", ") || "—"}</td>
              <td>
                {s.amountOwed > 0
                  ? <span className="badge bg-warning text-dark">${s.amountOwed.toFixed(2)}</span>
                  : <span className="text-muted">$0.00</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Suppliers;
