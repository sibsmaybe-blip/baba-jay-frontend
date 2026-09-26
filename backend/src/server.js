import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import partsRoutes from "./routes/parts.js";
import inventoryRoutes from "./routes/inventory.js";
import salesRoutes from "./routes/sales.js";
import invoicesRoutes from "./routes/invoices.js";
import customersRoutes from "./routes/customers.js";
import suppliersRoutes from "./routes/suppliers.js";
import purchasesRoutes from "./routes/purchases.js";
import quotationsRoutes from "./routes/quotations.js";
import returnsRoutes from "./routes/returns.js";
import expensesRoutes from "./routes/expenses.js";
import reportsRoutes from "./routes/reports.js";
import auditRoutes from "./routes/audit.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/parts", partsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/quotations", quotationsRoutes);
app.use("/api/returns", returnsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);

// --- Serve the built frontend ---
// The build step copies the frontend's dist/ folder here as backend/public.
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// SPA fallback: React Router handles routes like /pos or /customers
// entirely in the browser — but if someone refreshes the page while on
// /pos, the browser asks the SERVER for /pos directly, and there's no
// real file called that. This sends index.html for any GET request that
// isn't an API call, and React Router takes over from there.
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) return next();
  res.sendFile(path.join(publicPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

// Catches any error thrown/rejected in a route (including DB connection
// failures) and returns clean JSON instead of Express's default HTML
// stack-trace page.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Baba-Jay backend running on http://localhost:${PORT}`);
});