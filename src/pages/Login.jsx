import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandMark from "../components/BrandMark";
import Alert from "../components/Alert";
import flierImg from "../assets/images/flier.jpg";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const result = await login(username, password);
    if (result.success) navigate("/");
    else setError(result.message);
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Hero panel — the first thing anyone sees */}
      <div
        className="d-none d-md-flex flex-column justify-content-between"
        style={{
          width: "45%",
          backgroundImage: `linear-gradient(160deg, rgba(74,32,54,0.90) 0%, rgba(199,63,104,0.80) 55%, rgba(231,84,128,0.65) 130%), url(${flierImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          padding: "48px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Motto watermark — faint, repeated diagonally in the background */}
        <div className="motto-watermark" style={{ top: "20%", left: "-10%", transform: "rotate(-18deg)" }}>
          Colours for Every Space, Quality for Every Project
        </div>
        <div className="motto-watermark" style={{ top: "55%", left: "-15%", transform: "rotate(-18deg)" }}>
          Colours for Every Space, Quality for Every Project
        </div>
        <div className="motto-watermark" style={{ top: "88%", left: "-10%", transform: "rotate(-18deg)" }}>
          Colours for Every Space, Quality for Every Project
        </div>

        <div className="d-flex align-items-center gap-2" style={{ position: "relative" }}>
          <BrandMark size={28} color="white" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "0.03em" }}>
            BABA-JAY PAINTS
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: "2.1rem", lineHeight: 1.15, maxWidth: "380px" }}>
            Colours for Every Space, Quality for Every Project.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: "360px" }}>
            Paint, primers, and finishes — inventory, sales, and suppliers, from the counter to the back store room.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="d-flex align-items-center justify-content-center flex-grow-1" style={{ background: "var(--blush)" }}>
        <form onSubmit={handleSubmit} className="p-4" style={{ width: "320px" }}>
          <div className="d-md-none d-flex align-items-center gap-2 mb-4">
            <BrandMark size={26} color="var(--bubblegum)" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--plum)" }}>
              BABA-JAY PAINTS
            </span>
          </div>

          <h4 className="mb-1" style={{ color: "var(--plum)" }}>Sign in</h4>
          <p className="text-muted small mb-4">Enter your account details to continue</p>

          {error && <Alert type="danger">{error}</Alert>}

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary w-100">Log In</button>

          <p className="text-muted small mt-3 mb-0">
            Try: <code>yvette</code> / <code>admin123</code> (Admin)
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
