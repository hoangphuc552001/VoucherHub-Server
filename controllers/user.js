const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Counterpart = require("../models/counterpart");
const SECONDS_PER_DAY = 60 * 60 * 24;

exports.createUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const isNewUser = await User.inThisEmailInUse(email);
  if (!isNewUser)
    return res.status(400).send({ error: "User already registered" });
  const user = await User({ fullName, email, password, role }).save();
  return res.json({ success: true, user });
};

exports.userSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: "User not found" });
    const isPasswordMatch = await user.comparePassword(password);
    let token;
    if (!isPasswordMatch)
      return res.status(400).send({ error: "Password is incorrect" });
    if (user.role === "Counterpart") {
      const counterpart = await Counterpart.findOne({ userID: user._id });
      if (counterpart !== null) {
        token = jwt.sign(
          { _id: user._id, counterpartID: counterpart._id },
          process.env.JWT_SECRET,
          {
            expiresIn: SECONDS_PER_DAY,
          }
        );
      } else {
        token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: SECONDS_PER_DAY,
        });
      }
      // token = jwt.sign(
      //   { _id: user._id, counterpartID: counterpart._id },
      //   process.env.JWT_SECRET,
      //   {
      //     expiresIn: SECONDS_PER_DAY,
      //   }
      // );
    } else {
      token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: SECONDS_PER_DAY,
      });
    }

    const expiredAt = new Date(Date.now() + SECONDS_PER_DAY * 1000).getTime();
    return res
      .status(200)
      .json({ success: true, user, token, expiredAt: expiredAt });
  } catch (e) {
    console.log(e);
  }
};

exports.signOut = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization fail!" });
    }
    res.json({ success: true, message: "Sign out successfully!" });
  }
};
const cloudinary = require("../utils/imageUpload");
const counterpart = require("../models/counterpart");
exports.uploadAvatar = async (req, res) => {
  const { _id } = req.user;
  if (!_id) return res.status(400).send({ error: "User not found" });
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "VoucherHub",
      public_id: `${_id}_profile`,
      width: 500,
      height: 500,
      crop: "fill",
    });
    const updateUser = await User.findByIdAndUpdate(_id, {
      avatar: result.secure_url,
    });
    const user = {
      _id: updateUser._id,
      fullName: updateUser.fullName,
      email: updateUser.email,
      avatar: result.secure_url,
    };
    res
      .status(201)
      .json({ success: true, message: "Your profile has updated!", user });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
    console.log("Error while uploading profile image", e.message);
  }
};

exports.getProfileUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const [tokenType, accessToken] = authHeader.split(" ");
    const payload = jwt.decode(accessToken);
    const user = await Counterpart.findOne({ userID: payload._id }).populate(
      "userID"
    );
    console.log(user);

    if (!user) {
      const temp = await User.findOne({ _id: payload._id });
      return res.status(200).json({
        success: true,
        _id: temp._id,
        email: temp.email,
        fullName: temp.fullName,
      });
    }
    // if (!user) return res.status(400).send({ error: "User not found" });
    return res.status(200).json({
      success: true,
      _id: user._id,
      email: user.userID.email,
      fullName: user.userID.fullName,
      avatarMobile: user.userID.avatar,
      avatar: user.image,
    });
  } catch (error) {
    console.log("failed to parse token", error);
    return res.status(400).json({
      success: false,
      message: "Failed to parse token.",
    });
  }
};

exports.getListEmailUser = async (req, res) => {
  try {
    const users = await User.find().select("-_id email avatar");
    if (!users) return res.status(400).send({ error: "User not found" });
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("failed to parse token", error);
    return res.status(400).json({
      success: false,
      message: "Failed to parse token.",
    });
  }
};

exports.getProfileUserWithRole = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.decode(token);
    const user = await User.findById(payload._id);
    if (!user) return res.status(400).send({ error: "User not found" });
    const ROLE = user.role;
    if (ROLE === "Counterpart") {
      const counterpart = await Counterpart.findOne({ userID: user._id });
      if (counterpart === null) {
        return res.status(200).json({
          success: true,
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
        });
      }
      return res.status(200).json({
        success: true,
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: counterpart.image,
      });
    } else if (ROLE === "User") {
      return res.status(200).json({
        success: true,
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      });
    } else if (ROLE === "Admin") {
      return res.status(200).json({
        success: true,
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const [tokenType, accessToken] = authHeader.split(" ");
    const payload = jwt.decode(accessToken);
    const user = await User.findOne({ _id: payload._id });
    console.log(user);
    if (!user) return res.status(400).send({ error: "User not found" });
    return res.status(200).json({
      success: true,
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    });
  } catch (error) {
    console.log("failed to parse token", error);
    return res.status(400).json({
      success: false,
      message: "Failed to parse token.",
    });
  }
};
exports.checkUserExistByEmail = async (req, res) => {
  const userEmail = req.body.email;
  try {
    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (user) {
        res.status(201).json({ success: true, message: user });
      } else
        res
          .status(500)
          .json({ success: false, message: "can not find user id" });
    } else
      res.status(500).json({ success: false, message: "can not find user id" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
