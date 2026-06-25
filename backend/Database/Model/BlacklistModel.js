const { model } = require("mongoose");
const { BlacklistSchema } = require("../Schema/BlacklistSchema");
const BlacklistModel = model("blacklist", BlacklistSchema);
module.exports = { BlacklistModel };
