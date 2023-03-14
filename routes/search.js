const express = require("express");
const {
  searchCampaign,
  searchStore,
  searchEmployee,
  searchPayment,
} = require("../controllers/search");
const { isAuth, isCounterpart } = require("../middlewares/auth");
const router = express.Router();

router.get("/campaign", isAuth, isCounterpart, searchCampaign);
router.get("/store", isAuth, isCounterpart, searchStore);
router.get("/employee", isAuth, isCounterpart, searchEmployee);
router.get("/payment", isAuth, isCounterpart, searchPayment);

module.exports = router;
