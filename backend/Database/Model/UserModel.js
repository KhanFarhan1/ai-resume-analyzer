const { model } = require("mongoose");
const { UserSchema } = require("../Schema/UserScheme");
const UserModel = model("user", UserSchema);
module.exports = { UserModel };
