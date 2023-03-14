const Notification = require("../../models/notification");

exports.getAllNotification = async (req, res) => {
  try {
    try {
      const notifications = await Notification.find({
        userID: "63c0df555c82e28ff69f8a5b",
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
      console.log(e);
      res.status(400).send({ success: false, message: e.message });
    }
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateSeen = async (req, res) => {
  try {
    try {
      const notifications = await Notification.updateMany(
        { userID: "63c0df555c82e28ff69f8a5b" },
        { seen: true }
      );

      res.status(200).send({
        success: true,
        message: "Get all notifications successfully",
        notifications: notifications,
      });
    } catch (e) {
      console.log(e);
      res.status(400).send({ success: false, message: e.message });
    }
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};
