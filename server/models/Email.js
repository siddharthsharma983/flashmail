const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema(
  {
    senderEmail: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    subject: { type: String, default: "(No Subject)" },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Email", EmailSchema);
