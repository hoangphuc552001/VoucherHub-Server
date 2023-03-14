const express = require("express");
const {
  searchCampaign,
  searchCounterpart,
  searchUser,
  searchPayment,
  searchPuzzle,
} = require("../../controllers/admin/search.js");
const { authRole } = require("../../middlewares/auth");

const { isAuth } = require("../../middlewares/auth");
const router = express.Router();

router.get("/campaign", isAuth, authRole("Admin"), searchCampaign);
router.get("/user", isAuth, authRole("Admin"), searchUser);
router.get("/counterpart", isAuth, authRole("Admin"), searchCounterpart);
router.get("/payment", isAuth, authRole("Admin"), searchPayment);
router.get("/puzzle", isAuth, authRole("Admin"), searchPuzzle);

module.exports = router;
