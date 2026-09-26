import jwt from "jsonwebtoken";

// Checks for a valid token on every protected request. The frontend
// will send it as: Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, username, role }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Use after requireAuth: requireRole("Admin") or requireRole("Admin", "StockManager")
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have permission for this action" });
    }
    next();
  };
}
