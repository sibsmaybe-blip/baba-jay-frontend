// Single source of truth for the sidebar. Add a module here once,
// and it appears in nav automatically — no need to edit Layout.jsx per page.
// "roles" controls who sees the link (ties into the auth module later).

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "bi-speedometer2", roles: ["Admin", "Salesperson", "StockManager", "Cashier"] },
  { label: "Point of Sale", path: "/pos", icon: "bi-cart-check", roles: ["Admin", "Salesperson", "Cashier"] },
  { label: "Paint Products", path: "/parts", icon: "bi-palette2", roles: ["Admin", "StockManager"] },
  { label: "Inventory", path: "/inventory", icon: "bi-boxes", roles: ["Admin", "StockManager"] },
  { label: "Customers", path: "/customers", icon: "bi-people", roles: ["Admin", "Salesperson"] },
  { label: "Suppliers", path: "/suppliers", icon: "bi-truck", roles: ["Admin", "StockManager"] },
  { label: "Purchasing", path: "/purchasing", icon: "bi-bag-plus", roles: ["Admin", "StockManager"] },
  { label: "Quotations", path: "/quotations", icon: "bi-file-earmark-text", roles: ["Admin", "Salesperson"] },
  { label: "Invoices", path: "/invoices", icon: "bi-receipt", roles: ["Admin", "Salesperson", "Cashier"] },
  { label: "Returns", path: "/returns", icon: "bi-arrow-return-left", roles: ["Admin", "StockManager"] },
  { label: "Expenses", path: "/expenses", icon: "bi-cash-stack", roles: ["Admin"] },
  { label: "Reports", path: "/reports", icon: "bi-bar-chart", roles: ["Admin"] },
  { label: "Audit Log", path: "/audit", icon: "bi-clock-history", roles: ["Admin"] },
  { label: "Users", path: "/users", icon: "bi-person-gear", roles: ["Admin"] },
];
