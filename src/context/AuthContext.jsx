import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../api/api";

// Context solves a specific problem: currentUser is needed in MANY places
// (Layout's sidebar, every page checking permissions, etc.) but those
// components aren't necessarily parent/child of each other. Instead of
// passing currentUser down through props at every level ("prop drilling"),
// Context lets any component just ask for it directly.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load/refresh, check if someone was already logged in.
  // localStorage persists across browser refreshes (unlike useState alone).
  useEffect(() => {
    const saved = localStorage.getItem("baba-jay-user");
    if (saved) setCurrentUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  async function login(username, password) {
    const result = await apiLogin(username, password);
    if (result.success) {
      setCurrentUser(result.user);
      localStorage.setItem("baba-jay-user", JSON.stringify(result.user));
      // The real backend's login response includes a token — save it
      // separately so api.js's authHeaders() can attach it to every
      // other request. The mock login never returns one, so this is
      // skipped harmlessly while USE_MOCK was still true.
      if (result.token) {
        localStorage.setItem("baba-jay-token", result.token);
      }
    }
    return result;
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("baba-jay-user");
    localStorage.removeItem("baba-jay-token");
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — this is just a shortcut so other files write
// `const { currentUser } = useAuth();` instead of importing
// useContext and AuthContext separately every time.
export function useAuth() {
  return useContext(AuthContext);
}
