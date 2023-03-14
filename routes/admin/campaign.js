const express = require("express");
const {
  getAllCampaignsByAdmin,
  updateCampaign,
  refuseCampaign,
} = require("../../controllers/admin/campaign");
const { isAuth, authRole } = require("../../middlewares/auth");

const router = express.Router();
router.get("/", isAuth, authRole("Admin"), getAllCampaignsByAdmin);
router.post("/refuse", isAuth, authRole("Admin"), refuseCampaign);
router.post("/", isAuth, authRole("Admin"), updateCampaign);

module.exports = router;
