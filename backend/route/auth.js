const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { UserModel } = require("../Database/Model/UserModel");
const { BlacklistModel } = require("../Database/Model/BlacklistModel");
const { SessionModel } = require("../Database/Model/SessionModel");

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
      return res.status(400).json({
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
    const refreshtoken = jwt.sign(
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

    const refreshtokenhash = crypto
      .createHash("sha256")
      .update(refreshtoken)
      .digest("hex");

    const session = await new SessionModel({
      id: user._id,
      refreshtokenhash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await session.save();

    const accesstoken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        name: user.name,
      },
      process.env.JWT,
      {
        expiresIn: "8m",
      },
    );
    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      message: "New User Successfully Created!!",
      user: { username, email },
      accesstoken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error in Register" });
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Fill the creditial!!" });
    }
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid Username or Password!!" });
    }
    const ValidPassword = await bcrypt.compare(password, user.password);
    if (!ValidPassword) {
      return res
        .status(400)
        .json({ message: "Invalid Username or Password!!" });
    }
    const refreshtoken = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "7d",
    });
    const refreshtokenhash = crypto
      .createHash("sha256")
      .update(refreshtoken)
      .digest("hex");
    const session = await new SessionModel({
      id: user._id,
      refreshtokenhash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await session.save();
    const accesstoken = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "8m",
    });
    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "User LoggedIn Successfully!!",
      user: { username: user.username, email: user.email },
      accesstoken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!!(Login)" });
  }
});

router.get("/get_me", async (req, res) => {
  try {
    // Get accesstoken from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access Token Not Found!!" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT);

    // Find user by ID
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User Not Found!!" });
    }

    res.status(200).json({
      message: "User Found!!",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!!(Get-Me)" });
    console.log(error);
  }
});

router.get("/refreshtoken", async (req, res) => {
  const refreshtoken = req.cookies.refreshtoken;
  if (!refreshtoken) {
    return res.status(401).json({ message: "Refresh Not found!!" });
  }

  const decoded = jwt.verify(refreshtoken, process.env.JWT);

  const refreshtokenhash = crypto
    .createHash("sha256")
    .update(refreshtoken)
    .digest("hex");

  const session = await SessionModel.findOne({
    refreshtokenhash,
    revoke: false,
  });
  if (!session) {
    return res.status(401).json({ message: "Invalid Session Token" });
  }
  const accesstoken = jwt.sign({ id: decoded.id }, process.env.JWT, {
    expiresIn: "8m",
  });

  const newrefreshtoken = jwt.sign(
    {
      id: decoded.id,
    },
    process.env.JWT,
    { expiresIn: "7d" },
  );

  const newrefreshtokenhash = crypto
    .createHash("sha256")
    .update(newrefreshtoken)
    .digest("hex");

  session.refreshtokenhash = newrefreshtokenhash;
  await session.save();

  res.cookie("refreshtoken", newrefreshtoken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
    message: "Access Token Created Successfully!!",
    accesstoken,
  });
});

router.get("/logout", async (req, res) => {
  const refreshtoken = req.cookies.refreshtoken;
  if (!refreshtoken) {
    return res.status(401).json({ message: "Refresh-Token NOT Found!!" });
  }

  const refreshtokenhash = crypto
    .createHash("sha256")
    .update(refreshtoken)
    .digest("hex");

  const session = await SessionModel.findOne({
    refreshtokenhash,
    revoke: false,
  });

  if (!session) {
    return res.status(400).json({ message: "Invalid Refresh Token!!" });
  }
  session.revoke = true;
  await session.save();
  res.clearCookie("refreshtoken");
  res.status(200).json({ message: "Logout Successfully!!" });
});

router.get("/logout_all", async (req, res) => {
  const refreshtoken = req.cookies.refreshtoken;
  if (!refreshtoken) {
    return res.status(401).json({ message: "Refresh Token Not Found!!" });
  }
  const decoded = jwt.verify(refreshtoken, process.env.JWT);
  await SessionModel.updateMany(
    { id: decoded.id, revoke: false },
    { revoke: true },
  );
  res.clearCookie("refreshtoken");
  res.status(200).json({ message: "Logout From all device !!" });
});

module.exports = router;
