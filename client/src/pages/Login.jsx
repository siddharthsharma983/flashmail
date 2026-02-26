import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    try {
      const { data } = await login(formData);
      localStorage.setItem("token", data.token);
      navigate("/chat");
    } catch (err) {
      setErrMsg(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.logo}>FlashMail</h1>
        <p style={styles.subtitle}>Login to continue</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            style={styles.input}
            required
          />

          {errMsg ? <div style={styles.error}>{errMsg}</div> : null}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p style={styles.footerText}>
            Don't have account?{" "}
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    width: "100%",
    background: "linear-gradient(135deg,#0b0f1a,#07111f)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    animation: "fadeIn 300ms ease",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(12,18,28,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 34,
    boxShadow: "0 0 60px rgba(0,0,0,0.7)",
    backdropFilter: "blur(10px)",
    textAlign: "center",
    transform: "translateY(0)",
    animation: "pop 280ms ease",
  },
  logo: { color: "#fff", margin: 0, fontSize: 36, letterSpacing: 0.3 },
  subtitle: { color: "#8ea0b8", marginTop: 8, marginBottom: 26 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  input: {
    height: 48,
    padding: "0 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#fff",
    outline: "none",
    fontSize: 14,
  },
  button: {
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 6,
  },
  footerText: { marginTop: 10, color: "#8ea0b8" },
  link: { color: "#3b82f6", textDecoration: "none", fontWeight: 700 },
  error: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#fecaca",
    fontSize: 13,
    textAlign: "left",
  },
};

export default Login;
