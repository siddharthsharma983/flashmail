const express = require("express");
const router = express.Router();
const { sendEmail, getInbox } = require("../controllers/emailController");
const auth = require("../middleware/auth");

// @route   POST api/emails/send
// @desc    Send a new email
// @access  Private (Requires Token)
router.post("/send", auth, sendEmail);

// @route   GET api/emails/inbox/:email
// @desc    Get all emails for a specific receiver
// @access  Private (Requires Token)
router.get("/inbox/:email", auth, getInbox);

module.exports = router;
