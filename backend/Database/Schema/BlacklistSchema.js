const { Schema } = require("mongoose");

const BlacklistSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

module.exports = { BlacklistSchema };
