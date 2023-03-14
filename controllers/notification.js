const Notification = require("../models/notification");
const io = require("../app");
exports.addNoti = async (
  userID,
  image,
  title,
  description,
  all,
  campaignID
) => {
  const newNoti = new Notification({
    userID,
    image,
    title,
    description,
    seen: false,
    all: all,
    campaignID,
  });
  await newNoti.save();
  io.emit("mod_notification");
};
exports.addNotification = async (req, res) => {
  try {
    const userID = req.user._id;
    if (!userID)
      return res
        .status(400)
        .send({ success: false, message: "User not found" });
    const { image, title, description } = req.body;
    const newNotification = new Notification({
      userID,
      image,
      title,
      description,
      seen: false,
      all: false,
    });
    await newNotification.save();
    io.emit("mod_notification", {
      image,
      title,
      description,
    });
    res
      .status(201)
      .send({ success: true, message: "Notification added successfully" });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
    throw new Error(e.message);
  }
};

exports.getNotificationByUser = async (req, res) => {
  try {
    const userID = req.user._id;
    if (!userID)
      return res
        .status(400)
        .send({ success: false, message: "User not found" });
    const notAllNoti = await Notification.find({ userID, all: false });
    const allNoti = await Notification.find({ all: true });
    let notifications = [...notAllNoti, ...allNoti];
    notifications.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    notifications.map((notification) => {
      notification.seen = true;
      notification.save();
    });
    console.log(notifications);
    res.status(200).send({
      success: true,
      message: "Get all notifications successfully",
      notifications,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
    throw new Error(e.message);
  }
};

exports.getNumberUnSeenByUser = async (req, res) => {
  try {
    const userID = req.user._id;
    if (!userID)
      return res
        .status(400)
        .send({ success: false, message: "User not found" });
    const notAllNoti = await Notification.find({
      userID,
      all: false,
      seen: false,
    });
    const allNoti = await Notification.find({ all: true, seen: false });
    let notifications = [...notAllNoti, ...allNoti];
    notifications.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    const number = notifications.length;
    res.status(200).send({
      success: true,
      message: "Get all notifications successfully",
      number,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
    throw new Error(e.message);
  }
};

exports.getNumberUnSeenByListUser = async (req, res) => {
  try {
    const userID = req.user._id;
    if (!userID)
      return res
        .status(400)
        .send({ success: false, message: "User not found" });
    const notAllNoti = await Notification.find({
      userID,
      all: false,
      seen: false,
    });
    const allNoti = await Notification.find({ all: true, seen: false });
    let notifications = [...notAllNoti, ...allNoti];
    notifications.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    const listID = notifications.map((notification) => {
      return notification._id;
    });
    res.status(200).send({
      success: true,
      message: "Get all notifications successfully",
      listID,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
    throw new Error(e.message);
  }
};

exports.deleteAll = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).send({
      success: true,
      message: "Delete all notifications successfully",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getNotificationByCounterpart = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userID: req.counterpartID,
    });
    notifications.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    const count = notifications.filter((item) => item.seen === false);
    res.status(200).send({
      success: true,
      message: "Get all notifications successfully",
      notifications: notifications,
      count: count.length,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
    throw new Error(e.message);
  }
};

exports.updateNotificationSeenByCounterpart = async (req, res) => {
  try {
    await Notification.updateMany(
      { userID: req.counterpartID },
      { seen: true }
    );
    res.status(200).send({
      success: true,
      message: "Update all notifications successfully",
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};
