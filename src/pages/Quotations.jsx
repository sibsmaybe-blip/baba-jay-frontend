import { useEffect, useState } from "react";
import { getQuotations, getParts, createQuotation, convertQuotation } from "../api/api";
import { useAuth } from "../context/AuthContext";
import PageBanner from "../components/PageBanner";

function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [parts, setParts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState([]);
  const { currentUser } = useAuth();

  async function load() {
    setQuotations(await getQuotations());
    setParts(await getParts());
  }

  useEffect(() => {
    load();
  }, []);

  function addItemRow() {
    if (parts.length === 0) return;
    setItems([...items, { id: parts[0].id, name: parts[0].name, price: parts[0].price, qty: 1 }]);
  }

  function updateItem(index, changes) {
    setItems(items.map((it, i) => (i === index ? { ...it, ...changes } : it)));
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (items.length === 0) return;
    await createQuotation({ customer: customer || "Walk-in", items });
    setCustomer("");
    setItems([]);
    setShowForm(false);
    load();
  }

  async function handleConvert(quo) {
    if (!confirm(`Convert ${quo.id} into a sale for $${quo.total.toFixed(2)}?`)) return;
    const result = await convertQuotation(quo.id, "Cash", currentUser.name);
    if (result.success) load();
  }

  return (
    <div>
      <PageBanner title="Quotations" subtitle="Build a quote, convert it to a sale when approved" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Quotation"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-3 mb-4 shadow-sm">
          <input className="form-control mb-3" placeholder="Customer name (or leave blank for Walk-in)"
            value={customer} onChange={(e) => setCustomer(e.target.value)} />

          {items.map((item, i) => (
            <div key={i} className="row g-2 mb-2 align-items-center">
              <div className="col-md-6">
                <select className="form-select" value={item.id}
                  onChange={(e) => {
                    const part = parts.find((p) => p.id === parseInt(e.target.value, 10));
                    updateItem(i, { id: part.id, name: part.name, price: part.price });
                  }}>
                  {parts.map((p) => <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)})</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <input type="number" className="form-control" placeholder="Qty" value={item.qty}
                  onChange={(e) => updateItem(i, { qty: parseInt(e.target.value, 10) || 0 })} />
              </div>
              <div className="col-md-2">
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-outline-secondary mb-3" onClick={addItemRow}>
            + Add Part
          </button>
          <div>
            <button type="submit" className="btn btn-primary" disabled={items.length === 0}>
              Save Quotation
            </button>
          </div>
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr><th>Quote #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {quotations.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{q.customer}</td>
              <td>{q.date}</td>
              <td className="small text-muted">{q.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
              <td>${q.total.toFixed(2)}</td>
              <td>
                <span className={`badge ${q.status === "Converted" ? "bg-success" : "bg-secondary"}`}>
                  {q.status}
                </span>
              </td>
              <td>
                {q.status === "Draft" && (
                  <button className="btn btn-sm btn-primary" onClick={() => handleConvert(q)}>
                    Convert to Sale
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Quotations;
