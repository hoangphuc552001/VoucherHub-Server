const express = require("express");
const {
  getAllCounterpart,
  updateCounterpart,
} = require("../../controllers/admin/counterpart");
const { isAuth, authRole } = require("../../middlewares/auth");

const router = express.Router();
router.get("/", isAuth, authRole("Admin"), getAllCounterpart);
router.post("/", isAuth, authRole("Admin"), updateCounterpart);

module.exports = router;
