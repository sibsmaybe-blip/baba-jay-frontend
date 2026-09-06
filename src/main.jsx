import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Bootstrap loaded via npm (Option B from earlier) since this is now a
// real build pipeline — Vite bundles it for you, no manual copying needed.
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/theme.css"; // brand overrides — loaded AFTER bootstrap

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
