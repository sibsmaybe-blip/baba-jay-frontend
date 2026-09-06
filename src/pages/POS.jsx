import { useEffect, useRef, useState } from "react";
import { getParts, completeSale } from "../api/api";
import { useAuth } from "../context/AuthContext";
import BarcodeScanner from "../components/BarcodeScanner";
import PageBanner from "../components/PageBanner";

const PAYMENT_METHODS = ["Cash", "EcoCash", "InnBucks", "Swipe/Card", "Bank Transfer"];

function POS() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]); // [{ id, name, price, qty }]
  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [cashTendered, setCashTendered] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const { currentUser } = useAuth();
  const searchInputRef = useRef(null);

  // Keep the search box focused whenever it's usable — a USB/handheld
  // scanner is just a very fast keyboard, so it needs a focused input
  // to "type" the barcode into. Re-focus after every cart action too,
  // so the cashier can keep scanning items back-to-back.
  useEffect(() => {
    if (!scannerOpen && !receipt) searchInputRef.current?.focus();
  });

  useEffect(() => {
    getParts().then(setParts);
  }, []);

  const filtered = search
    ? parts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    : [];

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = Math.max(0, subtotal - (parseFloat(discount) || 0));
  const change = paymentMethod === "Cash" && cashTendered
    ? Math.max(0, parseFloat(cashTendered) - total)
    : 0;

  function addToCart(part) {
    if (part.quantity <= 0) {
      alert(`${part.name} is out of stock.`);
      return;
    }
    const existing = cart.find((i) => i.id === part.id);
    if (existing) {
      if (existing.qty >= part.quantity) {
        alert(`Only ${part.quantity} in stock.`);
        return;
      }
      setCart(cart.map((i) => (i.id === part.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { id: part.id, name: part.name, price: part.price, qty: 1 }]);
    }
    setSearch("");
  }

  function handleBarcodeDetected(code) {
    setScannerOpen(false);
    const part = parts.find((p) => p.barcode === code);
    if (!part) {
      alert(`No part found for barcode ${code}.`);
      return;
    }
    addToCart(part);
  }

  // A USB/handheld scanner behaves exactly like very fast typing followed
  // by Enter. We don't need any special detection for "is this a scanner" —
  // we just check: does what's currently in the box exactly match a
  // barcode? If yes, treat it as a scan. If a human typed a partial name
  // and pressed Enter by accident, no barcode will match, so nothing happens.
  function handleSearchKeyDown(e) {
    if (e.key !== "Enter") return;
    const part = parts.find((p) => p.barcode === search.trim());
    if (part) {
      addToCart(part);
    }
  }

  function changeQty(id, delta) {
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(id) {
    setCart(cart.filter((i) => i.id !== id));
  }

  async function handleCompleteSale() {
    if (cart.length === 0) return;
    if (paymentMethod === "Cash" && (!cashTendered || parseFloat(cashTendered) < total)) {
      alert("Cash tendered must cover the total.");
      return;
    }
    const result = await completeSale({
      items: cart,
      customer: customer || "Walk-in",
      paymentMethod,
      discount: parseFloat(discount) || 0,
      cashTendered: parseFloat(cashTendered) || 0,
      performedBy: currentUser.name,
    });
    if (result.success) {
      setReceipt(result.invoice);
      setCart([]);
      setCustomer("");
      setDiscount("0");
      setCashTendered("");
      getParts().then(setParts); // refresh stock counts shown in search
    }
  }

  if (receipt) {
    return (
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "420px" }}>
        <h4 style={{ color: "var(--plum)" }}>Sale Complete ✓</h4>
        <p className="text-muted small">{receipt.id} — {new Date(receipt.date).toLocaleString()}</p>
        <p>Customer: {receipt.customer}</p>
        <ul className="list-group mb-2">
          {receipt.items.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between">
              <span>{item.name} × {item.qty}</span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="d-flex justify-content-between"><span>Subtotal</span><span>${receipt.subtotal.toFixed(2)}</span></div>
        <div className="d-flex justify-content-between"><span>Discount</span><span>-${receipt.discount.toFixed(2)}</span></div>
        <div className="d-flex justify-content-between fw-bold fs-5" style={{ color: "var(--plum)" }}>
          <span>Total</span><span>${receipt.total.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between text-muted small">
          <span>Paid via {receipt.paymentMethod}</span>
          {receipt.paymentMethod === "Cash" && <span>Change: ${receipt.change.toFixed(2)}</span>}
        </div>
        <button className="btn btn-primary mt-3" onClick={() => setReceipt(null)}>New Sale</button>
      </div>
    );
  }

  return (
    <div>
      <PageBanner title="Point of Sale" subtitle="Search, scan, and check out — cash, EcoCash, InnBucks, card, or transfer" />
      <div className="row g-4">
      <div className="col-md-7">
        <div className="d-flex gap-2 mb-1">
          <input
            ref={searchInputRef}
            className="form-control"
            placeholder="Search by name/SKU, or scan a barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="btn btn-primary text-nowrap" onClick={() => setScannerOpen(true)}>
            <i className="bi bi-camera me-1"></i> Camera Scan
          </button>
        </div>
        <p className="text-muted small mb-2">
          Handheld scanner works automatically while this box is focused. No scanner? Use the camera button.
        </p>
        {filtered.length > 0 && (
          <div className="list-group mb-3 shadow-sm" style={{ maxHeight: "260px", overflowY: "auto" }}>
            {filtered.map((part) => (
              <button
                key={part.id}
                className="list-group-item list-group-item-action d-flex justify-content-between"
                onClick={() => addToCart(part)}
              >
                <span>{part.name} <span className="text-muted small">({part.sku})</span></span>
                <span>${part.price.toFixed(2)} — {part.quantity} in stock</span>
              </button>
            ))}
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-header" style={{ background: "var(--cream)" }}>Cart</div>
          {cart.length === 0 ? (
            <div className="card-body text-muted">Search and click a part to add it.</div>
          ) : (
            <ul className="list-group list-group-flush">
              {cart.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{item.name}</span>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(item.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(item.id, 1)}>+</button>
                    <span style={{ width: "70px" }} className="text-end">${(item.price * item.qty).toFixed(2)}</span>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="col-md-5">
        <div className="card shadow-sm p-3">
          <h5 style={{ color: "var(--plum)" }}>Checkout</h5>

          <label className="form-label small mt-2">Customer</label>
          <input className="form-control mb-2" placeholder="Walk-in"
            value={customer} onChange={(e) => setCustomer(e.target.value)} />

          <label className="form-label small">Discount ($)</label>
          <input type="number" className="form-control mb-2"
            value={discount} onChange={(e) => setDiscount(e.target.value)} />

          <label className="form-label small">Payment Method</label>
          <select className="form-select mb-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          {paymentMethod === "Cash" && (
            <>
              <label className="form-label small">Cash Tendered</label>
              <input type="number" className="form-control mb-2"
                value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} />
            </>
          )}

          <hr />
          <div className="d-flex justify-content-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="d-flex justify-content-between fw-bold fs-5" style={{ color: "var(--plum)" }}>
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          {paymentMethod === "Cash" && cashTendered && (
            <div className="d-flex justify-content-between text-muted small"><span>Change</span><span>${change.toFixed(2)}</span></div>
          )}

          <button className="btn btn-primary mt-3" disabled={cart.length === 0} onClick={handleCompleteSale}>
            Complete Sale
          </button>
        </div>
      </div>
      </div>

      {scannerOpen && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}

export default POS;
