import { Fragment, useEffect, useState } from "react";
import { getInvoices } from "../api/api";
import Alert from "../components/Alert";
import PageBanner from "../components/PageBanner";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getInvoices().then(setInvoices);
  }, []);

  return (
    <div>
      <PageBanner title="Invoices & Receipts" subtitle="Every completed sale, with full line-item detail" />

      {invoices.length === 0 && (
        <Alert type="info">No sales yet — completed POS sales will appear here.</Alert>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr><th>Invoice #</th><th>Date</th><th>Customer</th><th>Payment</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <Fragment key={inv.id}>
              <tr>
                <td>{inv.id}</td>
                <td>{new Date(inv.date).toLocaleString()}</td>
                <td>{inv.customer}</td>
                <td>{inv.paymentMethod}</td>
                <td>${inv.total.toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary"
                    onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}>
                    {expandedId === inv.id ? "Hide" : "View"}
                  </button>
                </td>
              </tr>
              {expandedId === inv.id && (
                <tr>
                  <td colSpan={6} className="bg-light">
                    <ul className="mb-1">
                      {inv.items.map((item, i) => (
                        <li key={i}>{item.name} × {item.qty} — ${(item.price * item.qty).toFixed(2)}</li>
                      ))}
                    </ul>
                    <div className="small text-muted">
                      Subtotal ${inv.subtotal.toFixed(2)} · Discount ${inv.discount.toFixed(2)}
                      {inv.paymentMethod === "Cash" && ` · Change $${inv.change.toFixed(2)}`}
                    </div>
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

export default Invoices;
