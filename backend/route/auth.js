const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { UserModel } = require("../Database/Model/UserModel");
const { BlacklistModel } = require("../Database/Model/BlacklistModel");
const { Validate_User } = require("../middleware/auth.middleware");

router.post("/register", async (req, res) => {
  try {
    let { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Fill all required detial" });
    }
    let alreadyresgisteruser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });
    if (alreadyresgisteruser) {
      res.status(400).json({
        message:
          "There is some one already register with this username or email",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await new UserModel({
      name,
      username,
      email,
      password: hash,
    });
    await user.save();
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        name: user.name,
      },
      process.env.JWT,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token);
    res.status(201).json({ message: "New User Successfully Created!!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error in Register" });
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res.status(404).json({ message: "Fill all required Detial!!" });
    }
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Username invalid" });
    }
    const ValidPassword = await bcrypt.compare(password, user.password);
    if (!ValidPassword) {
      res.status(400).json({ message: "Username or Password is Invalid!!" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        name: user.username,
      },
      process.env.JWT,
      { expiresIn: "1d" },
    );
    res.cookie("token", token);
    return res.status(200).json({
      message: "User Logged In Successfully",
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log("Error for login", error);
  }
});

router.get("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "Token is empty" });
    }
    let newBlacklisttoken = await BlacklistModel({
      token,
    });
    await newBlacklisttoken.save();
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logged Out Successfully",
    });
  } catch (error) {
    res.sendStatus(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get_me", Validate_User, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    res.status(200).json({
      message: "Fetch User Data is Successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = router;
