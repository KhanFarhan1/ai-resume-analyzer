const { model } = require("mongoose");
const { SessionSchema } = require("../Schema/SessionSchema");
const SessionModel = model("session", SessionSchema);
module.exports = { SessionModel };
