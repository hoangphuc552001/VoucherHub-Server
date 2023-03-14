const express = require("express");
const {
  getGeneralStatistic,
  getVoucherStatistic,
  getGameStatistic,
  getDiscountStatistic,
  getUserStatistic,
} = require("../controllers/statistic");
const { isAuth, isCounterpart } = require("../middlewares/auth");
const router = express.Router();

router.get("/game/:id", isAuth, isCounterpart, getGameStatistic);
router.get("/discount/:id", isAuth, isCounterpart, getDiscountStatistic);
router.get("/:option", isAuth, isCounterpart, getGeneralStatistic);
router.post("/voucher", isAuth, isCounterpart, getVoucherStatistic);
router.post("/user", isAuth, isCounterpart, getUserStatistic);

module.exports = router;
