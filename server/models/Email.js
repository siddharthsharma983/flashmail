const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  subject: { type: String, default: "(No Subject)" },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }, // Logic: Kya receiver ne mail padha?
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Email", EmailSchema);
