const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Email = require("../models/Email");

// Send email
router.post("/send", auth, async (req, res) => {
  try {
    const { recipientEmail, subject, message } = req.body;

    const mail = await Email.create({
      senderEmail: req.user.email,
      recipientEmail,
      subject,
      message,
    });

    res.json(mail);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Inbox
router.get("/inbox", auth, async (req, res) => {
  try {
    const emails = await Email.find({ recipientEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(emails);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Sent
router.get("/sent", auth, async (req, res) => {
  try {
    const emails = await Email.find({ senderEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(emails);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ msg: "Email not found" });

    if (
      email.senderEmail !== req.user.email &&
      email.recipientEmail !== req.user.email
    ) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Email.findByIdAndDelete(req.params.id);
    res.json({ msg: "Email deleted" });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
