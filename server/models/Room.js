const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true }, // join code
    type: { type: String, enum: ["global", "private"], default: "private" },

    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminEmail: { type: String, required: true },

    members: { type: [String], default: [] }, // emails
    blocked: { type: [String], default: [] }, // emails

    // users who requested join but not approved
    pending: { type: [String], default: [] }, // emails
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", RoomSchema);
