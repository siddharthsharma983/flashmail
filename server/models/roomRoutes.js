const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Room = require("../models/Room");

const genCode = () => {
  // 6 char uppercase (easy type)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

// Create room (private/global)
router.post("/create", auth, async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name?.trim())
      return res.status(400).json({ msg: "Room name required" });

    let code = genCode();
    // ensure unique
    while (await Room.findOne({ code })) code = genCode();

    const room = await Room.create({
      name: name.trim(),
      type: type === "global" ? "global" : "private",
      code,
      adminUserId: req.user.id,
      adminEmail: req.user.email,
      members: [req.user.email], // creator is member
    });

    res.json(room);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// List my rooms (where I am member or admin)
router.get("/mine", auth, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [{ members: req.user.email }, { adminEmail: req.user.email }],
    }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Request join by code (private/global both)
router.post("/request-join", auth, async (req, res) => {
  try {
    const { code } = req.body;
    const room = await Room.findOne({
      code: (code || "").trim().toUpperCase(),
    });
    if (!room) return res.status(404).json({ msg: "Room not found" });

    const email = req.user.email;

    if (room.blocked.includes(email))
      return res.status(403).json({ msg: "You are blocked" });
    if (room.members.includes(email)) return res.json({ status: "member" });

    // global rooms: auto join
    if (room.type === "global") {
      room.members.push(email);
      room.pending = room.pending.filter((x) => x !== email);
      await room.save();
      return res.json({ status: "member" });
    }

    // private: add to pending (admin approval)
    if (!room.pending.includes(email)) {
      room.pending.push(email);
      await room.save();
    }
    res.json({ status: "pending" });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: view pending
router.get("/:code/pending", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ msg: "Room not found" });
    if (room.adminEmail !== req.user.email)
      return res.status(403).json({ msg: "Not admin" });
    res.json({ pending: room.pending });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: approve user
router.post("/:code/approve", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ msg: "Room not found" });
    if (room.adminEmail !== req.user.email)
      return res.status(403).json({ msg: "Not admin" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    room.pending = room.pending.filter((x) => x !== email);
    room.blocked = room.blocked.filter((x) => x !== email);
    if (!room.members.includes(email)) room.members.push(email);

    await room.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: kick user (remove from members)
router.post("/:code/kick", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ msg: "Room not found" });
    if (room.adminEmail !== req.user.email)
      return res.status(403).json({ msg: "Not admin" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    room.members = room.members.filter((x) => x !== email);
    room.pending = room.pending.filter((x) => x !== email);
    await room.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: block user (remove + blocked)
router.post("/:code/block", auth, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ msg: "Room not found" });
    if (room.adminEmail !== req.user.email)
      return res.status(403).json({ msg: "Not admin" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    room.members = room.members.filter((x) => x !== email);
    room.pending = room.pending.filter((x) => x !== email);
    if (!room.blocked.includes(email)) room.blocked.push(email);

    await room.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
