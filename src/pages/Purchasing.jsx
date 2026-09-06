import { useEffect, useState } from "react";
import { getPurchases, getSuppliers, getParts, createPurchaseOrder, receivePurchase } from "../api/api";
import { useAuth } from "../context/AuthContext";
import PageBanner from "../components/PageBanner";

function Purchasing() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([]); // { partId, name, qty, cost }
  const { currentUser } = useAuth();

  async function load() {
    setPurchases(await getPurchases());
    setSuppliers(await getSuppliers());
    setParts(await getParts());
  }

  useEffect(() => {
    load();
  }, []);

  function addItemRow() {
    if (parts.length === 0) return;
    setItems([...items, { partId: parts[0].id, name: parts[0].name, qty: 1, cost: parts[0].price }]);
  }

  function updateItem(index, changes) {
    setItems(items.map((it, i) => (i === index ? { ...it, ...changes } : it)));
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleCreatePO(e) {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === parseInt(supplierId, 10));
    if (!supplier || items.length === 0) return;
    await createPurchaseOrder({ supplierId: supplier.id, supplierName: supplier.name, items });
    setItems([]);
    setSupplierId("");
    setShowForm(false);
    load();
  }

  async function handleReceive(po) {
    await receivePurchase(po.id, currentUser.name);
    load();
  }

  return (
    <div>
      <PageBanner title="Purchasing" subtitle="Create purchase orders and receive stock" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Purchase Order"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePO} className="card p-3 mb-4 shadow-sm">
          <label className="form-label small">Supplier</label>
          <select className="form-select mb-3" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
            <option value="">Select a supplier...</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {items.map((item, i) => (
            <div key={i} className="row g-2 mb-2 align-items-center">
              <div className="col-md-5">
                <select className="form-select" value={item.partId}
                  onChange={(e) => {
                    const part = parts.find((p) => p.id === parseInt(e.target.value, 10));
                    updateItem(i, { partId: part.id, name: part.name, cost: part.price });
                  }}>
                  {parts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <input type="number" className="form-control" placeholder="Qty" value={item.qty}
                  onChange={(e) => updateItem(i, { qty: parseInt(e.target.value, 10) || 0 })} />
              </div>
              <div className="col-md-3">
                <input type="number" step="0.01" className="form-control" placeholder="Cost per unit" value={item.cost}
                  onChange={(e) => updateItem(i, { cost: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="col-md-1">
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-sm btn-outline-secondary mb-3" onClick={addItemRow}>
            + Add Part
          </button>

          <div>
            <button type="submit" className="btn btn-primary" disabled={items.length === 0 || !supplierId}>
              Create Purchase Order
            </button>
          </div>
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr><th>PO #</th><th>Supplier</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {purchases.map((po) => (
            <tr key={po.id}>
              <td>{po.id}</td>
              <td>{po.supplierName}</td>
              <td>{po.date}</td>
              <td className="small text-muted">{po.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
              <td>${po.totalCost.toFixed(2)}</td>
              <td>
                <span className={`badge ${po.status === "Received" ? "bg-success" : "bg-warning text-dark"}`}>
                  {po.status}
                </span>
              </td>
              <td>
                {po.status === "Pending" && (
                  <button className="btn btn-sm btn-primary" onClick={() => handleReceive(po)}>
                    Mark Received
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

export default Purchasing;
