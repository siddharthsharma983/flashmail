import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { loginSuccess } from "../features/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      localStorage.setItem("token", data.token);
      alert("Login Successful!");
      navigate("/inbox");
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid Credentials");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>FlashMail Login</h2>
        <input
          type="email"
          placeholder="Email"
          required
          style={styles.input}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          style={styles.input}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
        <p
          onClick={() => navigate("/register")}
          style={{ cursor: "pointer", marginTop: "10px" }}
        >
          New here? Register
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  form: {
    padding: "40px",
    background: "#fff",
    borderRadius: "8px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#202124",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Login;
