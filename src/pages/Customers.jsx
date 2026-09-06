import { Fragment, useEffect, useState } from "react";
import { getCustomers, createCustomer, getCustomerPurchases } from "../api/api";
import PageBanner from "../components/PageBanner";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [historyFor, setHistoryFor] = useState(null); // customer name currently expanded
  const [history, setHistory] = useState([]);

  async function load() {
    setCustomers(await getCustomers());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    await createCustomer(form);
    setForm({ name: "", phone: "", email: "" });
    setShowForm(false);
    load();
  }

  async function viewHistory(customer) {
    if (historyFor === customer.name) {
      setHistoryFor(null);
      return;
    }
    setHistory(await getCustomerPurchases(customer.name));
    setHistoryFor(customer.name);
  }

  return (
    <div>
      <PageBanner title="Customers" subtitle="Contacts and purchase history" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-3 mb-4 shadow-sm">
          <div className="row g-2">
            <div className="col-md-4">
              <input className="form-control" placeholder="Full name" value={form.name}
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
          <tr><th>Name</th><th>Phone</th><th>Email</th><th>Balance Owed</th><th></th></tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <Fragment key={c.id}>
              <tr>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>
                  {c.balanceOwed > 0
                    ? <span className="badge bg-warning text-dark">${c.balanceOwed.toFixed(2)}</span>
                    : <span className="text-muted">$0.00</span>}
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => viewHistory(c)}>
                    {historyFor === c.name ? "Hide" : "History"}
                  </button>
                </td>
              </tr>
              {historyFor === c.name && (
                <tr>
                  <td colSpan={5} className="bg-light">
                    {history.length === 0 ? (
                      <span className="text-muted">No purchases yet.</span>
                    ) : (
                      <ul className="mb-0">
                        {history.map((sale) => (
                          <li key={sale.id}>
                            {sale.id} — {new Date(sale.date).toLocaleDateString()} — ${sale.total.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;
