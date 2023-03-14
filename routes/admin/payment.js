const express = require("express");
const {
  getAllCounterpart,
  updateCounterpart,
} = require("../../controllers/admin/counterpart");
const { getAllPayment } = require("../../controllers/admin/payment");
const { isAuth, authRole } = require("../../middlewares/auth");

const router = express.Router();
router.get("/", isAuth, authRole("Admin"), getAllPayment);

module.exports = router;
