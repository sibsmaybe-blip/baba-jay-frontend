import { useEffect, useState } from "react";
import { getParts, createPart, deletePart } from "../api/api";
import { CATEGORIES } from "../data/mockParts";
import PageBanner from "../components/PageBanner";

function Parts() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sku: "", name: "", category: CATEGORIES[0], brand: "", price: "",
    oemNumber: "", location: "",
  });

  async function loadParts() {
    setParts(await getParts());
  }

  useEffect(() => {
    loadParts();
  }, []);

  // Search across name, SKU, product code, cross-reference, and
  // recommended surface (e.g. "wood", "wall").
  const filtered = parts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.oemNumber.toLowerCase().includes(q) ||
      p.crossRef.some((ref) => ref.toLowerCase().includes(q)) ||
      p.compatibleVehicles.some((surface) => surface.toLowerCase().includes(q))
    );
  });

  async function handleAdd(e) {
    e.preventDefault();
    await createPart({ ...form, price: parseFloat(form.price), crossRef: [], compatibleVehicles: [] });
    setForm({ sku: "", name: "", category: CATEGORIES[0], brand: "", price: "", oemNumber: "", location: "" });
    setShowForm(false);
    loadParts();
  }

  async function handleDelete(part) {
    if (!confirm(`Remove ${part.name}?`)) return;
    await deletePart(part.id);
    loadParts();
  }

  return (
    <div>
      <PageBanner title="Paint Products" subtitle="Search, add, and manage paint, primer, and finishing products" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Search by name, SKU, product code, cross-reference, or surface..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {showForm && (
        <form onSubmit={handleAdd} className="card p-3 mb-4 shadow-sm">
          <div className="row g-2">
            <div className="col-md-2">
              <input className="form-control" placeholder="SKU" value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Product name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <input className="form-control" placeholder="Brand" value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div className="col-md-1">
              <input type="number" step="0.01" className="form-control" placeholder="Price"
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input className="form-control" placeholder="Product code" value={form.oemNumber}
                onChange={(e) => setForm({ ...form, oemNumber: e.target.value })} />
            </div>
            <div className="col-md-10">
              <input className="form-control mt-2" placeholder="Shelf location (e.g. Aisle 2, Shelf B)"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="col-md-2 mt-2">
              <button type="submit" className="btn btn-primary w-100">Save Product</button>
            </div>
          </div>
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Recommended Surfaces</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((part) => (
            <tr key={part.id}>
              <td className="text-muted small">{part.sku}</td>
              <td>
                {part.name}
                <div className="text-muted small">{part.brand} · Code {part.oemNumber}</div>
              </td>
              <td><span className="badge" style={{ background: "var(--bubblegum)" }}>{part.category}</span></td>
              <td>${part.price.toFixed(2)}</td>
              <td>
                <span className={`badge ${part.quantity === 0 ? "bg-danger" : part.quantity <= part.reorderLevel ? "bg-warning text-dark" : "bg-success"}`}>
                  {part.quantity}
                </span>
              </td>
              <td className="small">
                {part.compatibleVehicles.map((surface, i) => (
                  <span key={i} className="badge bg-light text-dark border me-1">{surface}</span>
                ))}
              </td>
              <td className="text-end">
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(part)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Parts;
