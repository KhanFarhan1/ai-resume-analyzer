const jwt = require("jsonwebtoken");
const { BlacklistModel } = require("../Database/Model/BlacklistModel");
module.exports.Validate_User = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ message: "Token is Empty" });
  }
  let istokenblacklisted = await BlacklistModel.findOne({ token });
  if (istokenblacklisted) {
    return res.status(400).json({ message: "Token is Invalid" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      message: "Something went wrong",
    });
  }
};
