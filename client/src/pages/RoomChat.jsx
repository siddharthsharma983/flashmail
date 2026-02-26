import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  approveUser,
  blockUser,
  getPending,
  kickUser,
  requestJoin,
} from "../services/api";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
});

const RoomChat = () => {
  const nav = useNavigate();
  const { code } = useParams();
  const roomCode = useMemo(() => (code || "").toUpperCase(), [code]);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [pending, setPending] = useState([]);
  const [adminMode, setAdminMode] = useState(false);

  const chatEndRef = useRef(null);

  const email = localStorage.getItem("email") || "";
  const username =
    localStorage.getItem("username") || email.split("@")[0] || "User";

  const loadPending = async () => {
    try {
      const { data } = await getPending(roomCode);
      setPending(data.pending || []);
      setAdminMode(true);
    } catch {
      setAdminMode(false);
    }
  };

  useEffect(() => {
    socket.on("loadMessages", (old) => setMessages(old || []));
    socket.on("receiveMessage", (m) => setMessages((p) => [...p, m]));
    socket.on("system", (t) =>
      setMessages((p) => [
        ...p,
        { user: "System", text: t, time: new Date().toLocaleTimeString() },
      ]),
    );
    socket.on("roomError", async (msg) => {
      // If not approved yet -> request join (for private room)
      if (msg === "Not approved yet") {
        await requestJoin(roomCode);
        alert("Join request sent. Wait for admin approval.");
        nav("/dashboard");
      } else {
        alert(msg);
        nav("/dashboard");
      }
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
      socket.off("system");
      socket.off("roomError");
    };
  }, [nav, roomCode]);

  useEffect(() => {
    socket.emit("joinRoom", { roomCode, username, email });
    loadPending(); // if admin it will work
  }, [roomCode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    socket.emit("sendRoomMessage", { roomCode, text, username, email });
    setText("");
  };

  const approve = async (e) => {
    await approveUser(roomCode, e);
    loadPending();
  };
  const kick = async (e) => {
    await kickUser(roomCode, e);
    alert("User removed from room");
  };
  const block = async (e) => {
    await blockUser(roomCode, e);
    alert("User blocked");
    loadPending();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => nav("/dashboard")} style={styles.back}>
          ←
        </button>
        <div style={{ fontWeight: 900 }}>Room: {roomCode}</div>
        <div style={{ color: "#9ca3af", fontSize: 13 }}>{email}</div>
      </div>

      <div style={styles.body}>
        <div style={styles.chat}>
          <div style={styles.chatArea}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  alignSelf: m.user === username ? "flex-end" : "flex-start",
                  background: m.user === username ? "#2563eb" : "#1f2937",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 4 }}>
                  {m.user === username ? "You" : m.user}
                </div>
                <div>{m.text}</div>
                <div style={styles.time}>{m.time}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={styles.inputBar}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type message..."
              style={styles.input}
            />
            <button onClick={send} style={styles.btn}>
              Send
            </button>
          </div>
        </div>

        {adminMode && (
          <div style={styles.admin}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>
              Admin Panel{" "}
              <span title="Admin" style={styles.badge}>
                ADMIN
              </span>
            </div>

            <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 10 }}>
              Pending requests
            </div>

            {pending.length === 0 ? (
              <div style={{ color: "#9ca3af" }}>No pending</div>
            ) : (
              pending.map((p) => (
                <div key={p} style={styles.pendingRow}>
                  <div style={{ fontSize: 13 }}>{p}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={styles.smallBtn} onClick={() => approve(p)}>
                      Approve
                    </button>
                    <button style={styles.smallBtn2} onClick={() => kick(p)}>
                      Kick
                    </button>
                    <button
                      style={styles.smallBtnDanger}
                      onClick={() => block(p)}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    height: "100vh",
    background: "#0b1220",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 12,
    background: "#0f172a",
    borderBottom: "1px solid #1f2a44",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  back: {
    border: "1px solid #1f2a44",
    background: "transparent",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
  },
  body: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 12,
    padding: 12,
  },
  chat: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #1f2a44",
    borderRadius: 14,
    overflow: "hidden",
  },
  chatArea: {
    flex: 1,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  bubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  time: { fontSize: 10, opacity: 0.65, marginTop: 6 },
  inputBar: {
    display: "flex",
    gap: 10,
    padding: 12,
    borderTop: "1px solid #1f2a44",
    background: "#0f172a",
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #1f2a44",
    background: "#0b1220",
    color: "#fff",
    outline: "none",
  },
  btn: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  admin: {
    border: "1px solid #1f2a44",
    borderRadius: 14,
    padding: 12,
    background: "#0f172a",
  },
  badge: {
    marginLeft: 8,
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(37,99,235,0.2)",
    border: "1px solid rgba(37,99,235,0.5)",
  },
  pendingRow: {
    borderTop: "1px solid #1f2a44",
    paddingTop: 10,
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  smallBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  smallBtn2: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #1f2a44",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  smallBtnDanger: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};

export default RoomChat;
