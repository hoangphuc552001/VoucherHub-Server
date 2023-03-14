const express = require("express");
const Notification = require("../models/notification");

const { isAuth } = require("../middlewares/auth");
const {
  addNotification,
  getNotificationByUser,
  getNumberUnSeenByUser,
  getNumberUnSeenByListUser,
  deleteAll,
  getNotificationByCounterpart,
  updateNotificationSeenByCounterpart,
} = require("../controllers/notification");
const router = express.Router();
router.post("/add", isAuth, addNotification);
router.get("/user", isAuth, getNotificationByUser);
router.get("/counterpart", isAuth, getNotificationByCounterpart);
router.get("/seen", isAuth, updateNotificationSeenByCounterpart);
router.get("/numberunseen", isAuth, getNumberUnSeenByUser);
router.get("/numberunseen/list", isAuth, getNumberUnSeenByListUser);
router.post("/delete", isAuth, deleteAll);
module.exports = router;
