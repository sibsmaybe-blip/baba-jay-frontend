import { useEffect, useState } from "react";
import { getReturns, getInvoices, createReturn } from "../api/api";
import { useAuth } from "../context/AuthContext";
import PageBanner from "../components/PageBanner";

function Returns() {
  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [partId, setPartId] = useState("");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const { currentUser } = useAuth();

  async function load() {
    setReturns(await getReturns());
    setInvoices(await getInvoices());
  }

  useEffect(() => {
    load();
  }, []);

  const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);

  async function handleSubmit(e) {
    e.preventDefault();
    const item = selectedInvoice?.items.find((i) => i.id === parseInt(partId, 10));
    if (!item) return;
    await createReturn({
      invoiceId,
      partId: item.id,
      partName: item.name,
      qty: parseInt(qty, 10),
      reason,
      performedBy: currentUser.name,
    });
    setShowForm(false);
    setInvoiceId(""); setPartId(""); setQty(1); setReason("");
    load();
  }

  return (
    <div>
      <PageBanner title="Returns & Refunds" subtitle="Process a return against an original invoice" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Return"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
          <label className="form-label small">Original Invoice</label>
          <select className="form-select mb-2" value={invoiceId}
            onChange={(e) => { setInvoiceId(e.target.value); setPartId(""); }} required>
            <option value="">Select invoice...</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>{inv.id} — {inv.customer} — ${inv.total.toFixed(2)}</option>
            ))}
          </select>

          {selectedInvoice && (
            <>
              <label className="form-label small">Item Returned</label>
              <select className="form-select mb-2" value={partId} onChange={(e) => setPartId(e.target.value)} required>
                <option value="">Select item...</option>
                {selectedInvoice.items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} (bought ×{item.qty})</option>
                ))}
              </select>

              <label className="form-label small">Quantity Returned</label>
              <input type="number" min="1" className="form-control mb-2" value={qty}
                onChange={(e) => setQty(e.target.value)} required />

              <label className="form-label small">Reason</label>
              <input className="form-control mb-3" value={reason}
                onChange={(e) => setReason(e.target.value)} placeholder="e.g. wrong part, defective" required />

              <button type="submit" className="btn btn-primary">Process Return</button>
            </>
          )}
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr><th>Return #</th><th>Invoice</th><th>Part</th><th>Qty</th><th>Reason</th><th>Refund</th><th>Status</th></tr>
        </thead>
        <tbody>
          {returns.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.invoiceId}</td>
              <td>{r.partName}</td>
              <td>{r.qty}</td>
              <td className="small text-muted">{r.reason}</td>
              <td>${r.refundAmount.toFixed(2)}</td>
              <td><span className="badge bg-success">{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Returns;
