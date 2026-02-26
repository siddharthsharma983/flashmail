const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    // For Global chat use: "GLOBAL"
    // For Private rooms use: actual room code like "AB12CD"
    roomCode: { type: String, default: "GLOBAL", index: true },

    senderEmail: { type: String, default: "" },
    senderName: { type: String, default: "" },

    text: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", MessageSchema);
