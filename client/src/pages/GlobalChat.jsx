import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnection: true,
});

const GlobalChat = () => {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("receiveMessage", (data) =>
      setMessages((prev) => [...prev, data]),
    );
    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 1200);
    });
    socket.on("loadMessages", (old) => setMessages(old || []));

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
      socket.off("typing");
      socket.off("loadMessages");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const joinChat = () => {
    if (!username.trim()) return;
    setJoined(true);
    socket.emit("join", username.trim());
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", {
      user: username,
      text: message.trim(),
    });
    setMessage("");
  };

  const handleTyping = () => socket.emit("typing", username);

  if (!joined) {
    return (
      <div style={styles.joinWrap}>
        <div style={styles.joinCard}>
          <div style={styles.joinTop}>
            <div style={styles.title}>FlashMail Global Chat</div>
            <button onClick={logout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.joinInput}
          />
          <button onClick={joinChat} style={styles.primaryBtn}>
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        🌍 FlashMail Global Room | Online: {onlineUsers.length}
        <button onClick={logout} style={styles.logoutBtnInline}>
          Logout
        </button>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.user === username ? "flex-end" : "flex-start",
              background:
                msg.user === username ? "#2563eb" : "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={styles.msgUser}>
              {msg.user === username ? "You" : msg.user}
            </div>
            <div style={styles.msgText}>{msg.text}</div>
            <div style={styles.time}>{msg.time}</div>
          </div>
        ))}
        {typingUser ? (
          <div style={styles.typing}>{typingUser} is typing...</div>
        ) : null}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputBox}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={styles.primaryBtnSmall}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(135deg,#0b0f1a,#07111f)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 14,
    background: "rgba(12,18,28,0.85)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    textAlign: "center",
    fontWeight: 800,
    position: "relative",
  },
  logoutBtnInline: {
    position: "absolute",
    right: 16,
    top: 10,
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
  },
  chatBox: {
    flex: 1,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    gap: 10,
  },
  message: {
    padding: 12,
    borderRadius: 14,
    color: "#fff",
    maxWidth: "62%",
    fontSize: 14,
  },
  msgUser: { fontWeight: 800, marginBottom: 4, color: "rgba(255,255,255,0.9)" },
  msgText: { color: "rgba(255,255,255,0.92)" },
  typing: { fontSize: 12, color: "#8ea0b8", paddingLeft: 6 },
  time: { fontSize: 10, opacity: 0.6, marginTop: 6 },

  inputBox: {
    display: "flex",
    gap: 10,
    padding: 12,
    background: "rgba(12,18,28,0.85)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1,
    height: 44,
    padding: "0 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    borderRadius: 12,
    outline: "none",
  },
  primaryBtnSmall: {
    height: 44,
    padding: "0 18px",
    background: "#2563eb",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 12,
    fontWeight: 800,
  },

  joinWrap: {
    height: "100vh",
    width: "100%",
    background: "linear-gradient(135deg,#0b0f1a,#07111f)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  joinCard: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(12,18,28,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 0 60px rgba(0,0,0,0.65)",
    backdropFilter: "blur(10px)",
  },
  joinTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: 900 },
  logoutBtn: {
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
  },
  joinInput: {
    width: "100%",
    height: 48,
    padding: "0 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#fff",
    outline: "none",
    marginBottom: 12,
  },
  primaryBtn: {
    width: "100%",
    height: 48,
    background: "#2563eb",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 12,
    fontWeight: 900,
  },
};

export default GlobalChat;
