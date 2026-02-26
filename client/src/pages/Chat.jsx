import React, { useState } from "react";

const Chat = () => {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div style={styles.wrapper}>
      {!joined ? (
        <div style={styles.card}>
          <h1 style={styles.title}>FlashMail Global Chat</h1>

          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <button
            style={styles.button}
            onClick={() => username && setJoined(true)}
          >
            Join
          </button>
        </div>
      ) : (
        <div style={styles.chatBox}>
          <h2>Welcome {username} 👋</h2>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    background: "linear-gradient(135deg,#0f0f0f,#111827)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "400px",
    background: "#111",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 0 50px rgba(0,0,0,0.7)",
    animation: "fadeIn 0.5s ease-in-out",
  },
  title: {
    color: "#fff",
    marginBottom: "30px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1px solid #222",
    background: "#1f1f1f",
    color: "#fff",
  },
  button: {
    padding: "12px 25px",
    background: "#2563eb",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  chatBox: {
    width: "80%",
    height: "80vh",
    background: "#111",
    borderRadius: "20px",
    padding: "20px",
    color: "white",
  },
};

export default Chat;
