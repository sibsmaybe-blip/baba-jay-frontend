// Central place for all backend calls. Right now every function returns
// mock data. In Phase 7, you swap the *inside* of these functions to real
// fetch() calls — nothing that imports from here needs to change.

import { mockDashboardStats, mockLowStockParts, mockRecentTransactions } from "../data/mockData";
import { mockUsers } from "../data/mockUsers";
import { mockParts, logStockMovement, mockStockMovements } from "../data/mockParts";
import { mockCustomers } from "../data/mockCustomers";
import { mockSuppliers } from "../data/mockSuppliers";
import { mockPurchases } from "../data/mockPurchases";
import { mockSales } from "../data/mockSales";
import { mockQuotations, quotationCounter } from "../data/mockQuotations";
import { mockReturns } from "../data/mockReturns";
import { mockExpenses } from "../data/mockExpenses";

const USE_MOCK = false; // now pointing at the real backend
const BASE_URL = "http://localhost:5000/api";

// Attaches the login token (if we have one) to every request that needs it.
// The backend's requireAuth middleware checks for this exact header shape.
function authHeaders(extra = {}) {
  const token = localStorage.getItem("baba-jay-token");
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function getDashboardStats() {
  if (USE_MOCK) return mockDashboardStats;
  const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeaders() });
  return res.json();
}

export async function getLowStockParts() {
  if (USE_MOCK) return mockLowStockParts;
  const res = await fetch(`${BASE_URL}/inventory/low-stock`, { headers: authHeaders() });
  return res.json();
}

export async function getRecentTransactions() {
  if (USE_MOCK) return mockRecentTransactions;
  const res = await fetch(`${BASE_URL}/sales/recent`, { headers: authHeaders() });
  return res.json();
}

// --- Auth ---

export async function login(username, password) {
  if (USE_MOCK) {
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) return { success: false, message: "Invalid username or password" };
    if (!user.active) return { success: false, message: "This account has been deactivated" };
    // never send the password back to the app, even in mock mode
    const { password: _pw, ...safeUser } = user;
    return { success: true, user: safeUser };
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

// --- User management (Admin only) ---

export async function getUsers() {
  if (USE_MOCK) return mockUsers.map(({ password: _pw, ...u }) => u);
  const res = await fetch(`${BASE_URL}/users`, { headers: authHeaders() });
  return res.json();
}

export async function createUser(userData) {
  if (USE_MOCK) {
    const newUser = { id: Date.now(), active: true, ...userData };
    mockUsers.push(newUser);
    const { password: _pw, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  }
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function updateUser(id, changes) {
  if (USE_MOCK) {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) return { success: false };
    mockUsers[index] = { ...mockUsers[index], ...changes };
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(changes),
  });
  return res.json();
}

export async function deleteUser(id) {
  if (USE_MOCK) {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) mockUsers.splice(index, 1);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE", headers: authHeaders() });
  return res.json();
}


// Example of a write operation, for POS (Phase 3):
export async function createSale(saleData) {
  if (USE_MOCK) {
    console.log("Mock sale created:", saleData);
    return { success: true, id: `INV-${Date.now()}` };
  }
  const res = await fetch(`${BASE_URL}/sales`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(saleData),
  });
  return res.json();
}

// --- Parts ---

export async function getParts() {
  if (USE_MOCK) return [...mockParts];
  const res = await fetch(`${BASE_URL}/parts`, { headers: authHeaders() });
  return res.json();
}

export async function createPart(partData) {
  if (USE_MOCK) {
    const newPart = { id: Date.now(), quantity: 0, compatibleVehicles: [], crossRef: [], ...partData };
    mockParts.push(newPart);
    return { success: true, part: newPart };
  }
  const res = await fetch(`${BASE_URL}/parts`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(partData),
  });
  return res.json();
}

export async function updatePart(id, changes) {
  if (USE_MOCK) {
    const index = mockParts.findIndex((p) => p.id === id);
    if (index === -1) return { success: false };
    mockParts[index] = { ...mockParts[index], ...changes };
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/parts/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(changes),
  });
  return res.json();
}

export async function deletePart(id) {
  if (USE_MOCK) {
    const index = mockParts.findIndex((p) => p.id === id);
    if (index !== -1) mockParts.splice(index, 1);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/parts/${id}`, { method: "DELETE", headers: authHeaders() });
  return res.json();
}

// --- Inventory / stock adjustments ---

export async function adjustStock(partId, quantityChange, reason, performedBy) {
  if (USE_MOCK) {
    const part = mockParts.find((p) => p.id === partId);
    if (!part) return { success: false };
    part.quantity += quantityChange;
    logStockMovement({
      partId,
      partName: part.name,
      change: quantityChange,
      reason,
      performedBy,
      type: quantityChange >= 0 ? "increase" : "decrease",
    });
    return { success: true, newQuantity: part.quantity };
  }
  const res = await fetch(`${BASE_URL}/inventory/adjust`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ partId, quantityChange, reason, performedBy }),
  });
  return res.json();
}

// --- POS / Sales ---

export async function completeSale({ items, customer, paymentMethod, discount, cashTendered, performedBy }) {
  if (USE_MOCK) {
    // Deduct stock for every item sold — this is the automatic
    // inventory update the requirements doc calls for.
    for (const item of items) {
      const part = mockParts.find((p) => p.id === item.id);
      if (part) {
        part.quantity -= item.qty;
        logStockMovement({
          partId: part.id,
          partName: part.name,
          change: -item.qty,
          reason: "Sale",
          performedBy,
          type: "sale",
        });
      }
    }
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const total = subtotal - (discount || 0);
    const invoice = {
      id: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      items,
      customer,
      paymentMethod,
      subtotal,
      discount: discount || 0,
      total,
      change: cashTendered ? Math.max(0, cashTendered - total) : 0,
    };
    mockSales.unshift(invoice);
    return { success: true, invoice };
  }
  const res = await fetch(`${BASE_URL}/sales`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ items, customer, paymentMethod, discount, cashTendered }),
  });
  return res.json();
}

// --- Customers ---

export async function getCustomers() {
  if (USE_MOCK) return [...mockCustomers];
  const res = await fetch(`${BASE_URL}/customers`, { headers: authHeaders() });
  return res.json();
}

export async function createCustomer(data) {
  if (USE_MOCK) {
    const newCustomer = { id: Date.now(), balanceOwed: 0, ...data };
    mockCustomers.push(newCustomer);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return res.json();
}

// Purchase history for one customer — pulled from completed sales.
export async function getCustomerPurchases(customerName) {
  if (USE_MOCK) return mockSales.filter((s) => s.customer === customerName);
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerName)}/purchases`, { headers: authHeaders() });
  return res.json();
}

// --- Suppliers ---

export async function getSuppliers() {
  if (USE_MOCK) return [...mockSuppliers];
  const res = await fetch(`${BASE_URL}/suppliers`, { headers: authHeaders() });
  return res.json();
}

export async function createSupplier(data) {
  if (USE_MOCK) {
    const newSupplier = { id: Date.now(), partsSupplied: [], amountOwed: 0, ...data };
    mockSuppliers.push(newSupplier);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/suppliers`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- Purchasing / stock receiving ---

export async function getPurchases() {
  if (USE_MOCK) return [...mockPurchases];
  const res = await fetch(`${BASE_URL}/purchases`, { headers: authHeaders() });
  return res.json();
}

export async function createPurchaseOrder({ supplierId, supplierName, items }) {
  if (USE_MOCK) {
    const totalCost = items.reduce((sum, i) => sum + i.cost * i.qty, 0);
    const po = {
      id: `PO-${Date.now()}`,
      supplierId,
      supplierName,
      items,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
      totalCost,
    };
    mockPurchases.unshift(po);
    return { success: true, po };
  }
  const res = await fetch(`${BASE_URL}/purchases`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ supplierId, supplierName, items }),
  });
  return res.json();
}

// Marking a PO received automatically increases stock — this is the
// "purchase -> receiving -> inventory update" flow from your requirements.
export async function receivePurchase(poId, performedBy) {
  if (USE_MOCK) {
    const po = mockPurchases.find((p) => p.id === poId);
    if (!po || po.status === "Received") return { success: false };
    po.status = "Received";
    for (const item of po.items) {
      const part = mockParts.find((p) => p.id === item.partId);
      if (part) {
        part.quantity += item.qty;
        logStockMovement({
          partId: part.id,
          partName: part.name,
          change: item.qty,
          reason: `Received ${po.id} from ${po.supplierName}`,
          performedBy,
          type: "purchase",
        });
      }
    }
    const supplier = mockSuppliers.find((s) => s.id === po.supplierId);
    if (supplier) supplier.amountOwed += po.totalCost;
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/purchases/${poId}/receive`, { method: "POST" });
  return res.json();
}

// --- Quotations ---

export async function getQuotations() {
  if (USE_MOCK) return [...mockQuotations];
  const res = await fetch(`${BASE_URL}/quotations`, { headers: authHeaders() });
  return res.json();
}

export async function createQuotation({ customer, items }) {
  if (USE_MOCK) {
    quotationCounter.current += 1;
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const quotation = {
      id: `QUO-${quotationCounter.current}`,
      customer,
      items,
      total,
      status: "Draft",
      date: new Date().toISOString().slice(0, 10),
    };
    mockQuotations.unshift(quotation);
    return { success: true, quotation };
  }
  const res = await fetch(`${BASE_URL}/quotations`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ customer, items }),
  });
  return res.json();
}

// Converting a quotation reuses completeSale — same as ringing it up at POS,
// just skipping straight from "quoted" to "sold" instead of re-adding items.
export async function convertQuotation(quotationId, paymentMethod, performedBy) {
  if (USE_MOCK) {
    const quo = mockQuotations.find((q) => q.id === quotationId);
    if (!quo || quo.status === "Converted") return { success: false };
    const result = await completeSale({
      items: quo.items,
      customer: quo.customer,
      paymentMethod,
      discount: 0,
      cashTendered: quo.total,
      performedBy,
    });
    if (result.success) quo.status = "Converted";
    return result;
  }
  const res = await fetch(`${BASE_URL}/quotations/${quotationId}/convert`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ paymentMethod }),
  });
  return res.json();
}

// --- Invoices (reads from completed sales) ---

export async function getInvoices() {
  if (USE_MOCK) return [...mockSales];
  const res = await fetch(`${BASE_URL}/invoices`, { headers: authHeaders() });
  return res.json();
}

// --- Returns & Refunds ---

export async function getReturns() {
  if (USE_MOCK) return [...mockReturns];
  const res = await fetch(`${BASE_URL}/returns`, { headers: authHeaders() });
  return res.json();
}

export async function createReturn({ invoiceId, partId, partName, qty, reason, performedBy }) {
  if (USE_MOCK) {
    const part = mockParts.find((p) => p.id === partId);
    const invoiceItem = mockSales.find((s) => s.id === invoiceId)?.items.find((i) => i.id === partId);
    const refundAmount = invoiceItem ? invoiceItem.price * qty : 0;

    // Approved immediately in this mock flow; a real system might have a
    // separate approval step before stock/refund actually happen.
    if (part) {
      part.quantity += qty;
      logStockMovement({
        partId: part.id,
        partName: part.name,
        change: qty,
        reason: `Return — ${reason}`,
        performedBy,
        type: "return",
      });
    }

    const ret = {
      id: `RET-${Date.now()}`,
      invoiceId,
      partId,
      partName,
      qty,
      reason,
      refundAmount,
      status: "Approved",
      date: new Date().toISOString().slice(0, 10),
    };
    mockReturns.unshift(ret);
    return { success: true, return: ret };
  }
  const res = await fetch(`${BASE_URL}/returns`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ invoiceId, partId, qty, reason }),
  });
  return res.json();
}

// --- Expenses ---

export async function getExpenses() {
  if (USE_MOCK) return [...mockExpenses];
  const res = await fetch(`${BASE_URL}/expenses`, { headers: authHeaders() });
  return res.json();
}

export async function createExpense(data) {
  if (USE_MOCK) {
    const expense = { id: Date.now(), date: new Date().toISOString().slice(0, 10), ...data };
    mockExpenses.unshift(expense);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/expenses`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- Reports (derived from existing mock data — no separate storage needed) ---

export async function getReportsData() {
  if (USE_MOCK) {
    const revenue = mockSales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Sales by product — aggregate quantity & revenue per part name across all sales
    const salesByProduct = {};
    for (const sale of mockSales) {
      for (const item of sale.items) {
        if (!salesByProduct[item.name]) salesByProduct[item.name] = { name: item.name, qty: 0, revenue: 0 };
        salesByProduct[item.name].qty += item.qty;
        salesByProduct[item.name].revenue += item.price * item.qty;
      }
    }
    const bestSelling = Object.values(salesByProduct).sort((a, b) => b.qty - a.qty);

    const lowStock = mockParts.filter((p) => p.quantity <= p.reorderLevel);
    const outstandingPayments = mockCustomers.filter((c) => c.balanceOwed > 0);

    return {
      revenue,
      totalExpenses,
      grossProfit: revenue - totalExpenses,
      salesCount: mockSales.length,
      bestSelling,
      lowStock,
      outstandingPayments,
    };
  }
  const res = await fetch(`${BASE_URL}/reports/summary`, { headers: authHeaders() });
  return res.json();
}

// --- Audit / stock movement history ---

export async function getStockMovements() {
  if (USE_MOCK) return [...mockStockMovements];
  const res = await fetch(`${BASE_URL}/audit/movements`, { headers: authHeaders() });
  return res.json();
}
