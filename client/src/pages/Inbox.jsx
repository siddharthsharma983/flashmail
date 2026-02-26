import React, { useEffect, useState } from "react";
import { getInbox, deleteEmail } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [viewingEmail, setViewingEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const { data } = await getInbox();
      setEmails(data);
    } catch (err) {
      toast.error("Failed to load inbox");
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this email?")) return;
    try {
      await deleteEmail(id);
      setEmails(emails.filter((email) => email._id !== id));
      toast.success("Email deleted");
      setViewingEmail(null);
    } catch (err) {
      toast.error("Error deleting email");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0f0f0f",
        color: "#fff",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          background: "#111",
          padding: "20px",
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1 style={{ fontSize: "22px", marginBottom: "30px" }}>FlashMail</h1>
        <Link to="/inbox" style={styles.linkActive}>
          Inbox
        </Link>
        <Link to="/sent" style={styles.link}>
          Sent
        </Link>
        <Link to="/compose" style={styles.composeBtn}>
          Compose
        </Link>
        <Link
          to="/login"
          style={styles.logoutBtn}
          onClick={() => localStorage.removeItem("token")}
        >
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        {viewingEmail ? (
          <div>
            <button
              onClick={() => setViewingEmail(null)}
              style={styles.backBtn}
            >
              ← Back
            </button>
            <div style={styles.emailView}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>{viewingEmail.subject}</h2>
                <button
                  onClick={() => handleDelete(viewingEmail._id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
              <p style={{ color: "#888" }}>From: {viewingEmail.senderEmail}</p>
              <hr style={{ borderColor: "#222", margin: "20px 0" }} />
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {viewingEmail.message}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: "20px" }}>Inbox</h2>
            {emails.map((email) => (
              <div
                key={email._id}
                onClick={() => setViewingEmail(email)}
                style={styles.emailRow}
              >
                <div style={{ width: "150px", fontWeight: "bold" }}>
                  {email.senderEmail.split("@")[0]}
                </div>
                <div style={{ flex: 1, color: "#aaa" }}>
                  <strong>{email.subject}</strong> -{" "}
                  {email.message.substring(0, 50)}...
                </div>
                <div
                  style={{ color: "#ff4444" }}
                  onClick={(e) => handleDelete(email._id, e)}
                >
                  🗑
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  link: {
    color: "#888",
    textDecoration: "none",
    padding: "10px",
    marginBottom: 10,
  },
  linkActive: {
    color: "#fff",
    textDecoration: "none",
    padding: "10px",
    background: "#1a1a1a",
    borderRadius: "8px",
    marginBottom: 10,
  },
  composeBtn: {
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    textAlign: "center",
    textDecoration: "none",
    borderRadius: "8px",
    marginTop: "10px",
  },
  logoutBtn: {
    marginTop: "auto",
    color: "#555",
    textDecoration: "none",
    padding: "10px",
  },
  backBtn: {
    color: "#2563eb",
    background: "none",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px",
    fontSize: "16px",
  },
  emailView: {
    background: "#111",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #222",
  },
  deleteBtn: {
    background: "#ff4444",
    color: "#fff",
    border: "none",
    padding: "5px 15px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  emailRow: {
    display: "flex",
    padding: "15px",
    borderBottom: "1px solid #222",
    cursor: "pointer",
    alignItems: "center",
  },
};

export default Inbox;
