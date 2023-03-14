const express = require("express");
const {
  getAllNotification,
  updateSeen,
} = require("../../controllers/admin/notification");

const { isAuth, authRole } = require("../../middlewares/auth");

const router = express.Router();
router.get("/", isAuth, authRole("Admin"), getAllNotification);
router.get("/seen", isAuth, authRole("Admin"), updateSeen);

module.exports = router;
