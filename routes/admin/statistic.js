const express = require("express");
const {
  getGeneralStatistic,
  getVoucherStatistic,
  getAllVoucherStatistic,
  getAllUserStatistic,
  getUserStatistic,
  getGameStatistic,
  getCounterpartStatistic,
  getCampaignStatistic,
  getPuzzleStatistic,
} = require("../../controllers/admin/statistic");
const { isAuth, authRole } = require("../../middlewares/auth");
const router = express.Router();

router.get("/voucher/all", isAuth, authRole("Admin"), getAllVoucherStatistic);
router.get("/game", isAuth, authRole("Admin"), getGameStatistic);
router.post("/voucher", isAuth, authRole("Admin"), getVoucherStatistic);
router.post("/campaign", isAuth, authRole("Admin"), getCampaignStatistic);
router.post("/counterpart", isAuth, authRole("Admin"), getCounterpartStatistic);
router.get("/user/all", isAuth, authRole("Admin"), getAllUserStatistic);
router.post("/user", isAuth, authRole("Admin"), getUserStatistic);
router.post("/puzzle", isAuth, authRole("Admin"), getPuzzleStatistic);
router.get("/:option", isAuth, authRole("Admin"), getGeneralStatistic);

module.exports = router;
