const { Schema, default: mongoose } = require("mongoose");
const SessionSchema = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    refreshtokenhash: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    revoke: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
module.exports = { SessionSchema };
