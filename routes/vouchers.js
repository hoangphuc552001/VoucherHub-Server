const express = require("express");
const User = require("../models/user");
const { findPointAndDiscount } = require("../controllers/game");
const Campaign = require("../models/campaign");
const {
  getRandomNumberBaseOnUniswap,
  getRandomNumberBaseOnChainLink,
  getRandomNumberBaseOnUniswapWithNonceNumber,
} = require("../scripts/getRandomNumber");
const Voucher = require("../models/voucher");
const Puzzle = require("../models/puzzle");
const { playGame, playGamev2 } = require("../controllers/voucher");

function VoucherRouter(io) {
  const router = express.Router();
  const { isAuth } = require("../middlewares/auth");
  const {
    createVoucher,
    addVoucher,
    getAllVouchersById,
    getAllVouchersAndCategory,
    getAllVouchersByCategoryName,
    searchVouchersByDescriptionAndShop,
    playPuzzle,
  } = require("../controllers/voucher");
  router.post("/create", isAuth, createVoucher);
  router.post("/add", isAuth, addVoucher);
  router.get("/getAll", isAuth, getAllVouchersById);
  router.get("/gg", async (req, res) => {
    try {
      io.emit("notification_effect", {
        message: "hoang have received a voucher from Aeon",
        image: "https://i.imgur.com/4ZQ9Z0C.png",
      });
      return res.status(200).send({ success: true, message: "ok" });
    } catch (e) {
      console.log(e);
      return res.status(400).send({ success: false, message: e.message });
    }
  });
  router.post("/playgame", isAuth, playGamev2);
  router.post("/playpuzzle", isAuth, playPuzzle);
  router.post("/getAll", isAuth, getAllVouchersById);
  router.post("/vouchers-category", isAuth, getAllVouchersAndCategory);
  router.post("/category", isAuth, getAllVouchersByCategoryName);
  router.post("/search", isAuth, searchVouchersByDescriptionAndShop);
  return router;
}

module.exports = VoucherRouter;

const findRangeOfRandomNumber = (min, max, randNumber) => {
  let range = max - min + 1;
  return (randNumber % range) + min;
};

const checkRarityAndReturnPuzzle = (rarity, object) => {
  for (let i = 1; i <= 9; i++) {
    const nameProps = "piece_" + i;
    if (object[nameProps].min <= rarity && object[nameProps].max >= rarity) {
      return nameProps;
    }
  }
};

const setVoucherInformation = async (
  voucherId,
  campaignId,
  game,
  user,
  timeGet
) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const remainingVoucherCampaign = campaign.remainingVoucher;
    if (remainingVoucherCampaign <= 0) throw new Error("No voucher remaining");
    await Campaign.findByIdAndUpdate(
      campaignId,
      { remainingVoucher: remainingVoucherCampaign - 1 },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    await Voucher.findByIdAndUpdate(
      voucherId,
      { available: false, game, user, timeGet },
      {
        new: true,
        useFindAndModify: false,
      }
    );
  } catch (e) {
    throw new Error(e.message);
  }
};

const getCampaignInThisCampaignAndDiscount = async (campaignId, discount) => {
  try {
    console.log(campaignId, discount);
    return await Voucher.find({
      campaign: campaignId,
      discount,
      available: true,
    });
  } catch (e) {
    throw new Error(e.message);
  }
};
