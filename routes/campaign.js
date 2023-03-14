const express = require("express");

const {
  createCampaign,
  getAllCampaigns,
  getOneCampaign,
  updateCampaign,
  deleteMultipleCampaign,
  deleteSingleCampaign,
  getPopularBranch,
  getNewestCampaign,
  addFavorite,
  deleteFavorite,
  getListFavorite,
  getRelatedCampaign,
  getDetailsCampaign,
  getQuiz,
  getAll,
  getByCategory,
  getByBranch,
  getByCounterpart,
  searchCampaign,
  createCampaignForMobile, updateCampaignStatus, getListFavoriteProfile, deleteUsersJoinCampaign,
} = require("../controllers/campaign");
const {
  isAuth,
  isCounterpart,
  authRole,
  socketIO,
} = require("../middlewares/auth");
const router = express.Router();

router.get("/", isAuth, isCounterpart, getAllCampaigns);
router.post("/", isAuth, createCampaign);
router.get("/:id", isAuth, isCounterpart, getOneCampaign);
router.put("/", isAuth, isCounterpart, updateCampaign);
router.delete("/", isAuth, isCounterpart, deleteMultipleCampaign);
router.delete("/:id", isAuth, isCounterpart, deleteSingleCampaign);
router.get("/v1/newest", isAuth, getNewestCampaign);
router.get("/v1/popular-branch", isAuth, getPopularBranch);
router.post("/v1/favorite", isAuth, addFavorite);
router.post("/v1/favorite/delete", isAuth, deleteFavorite);
router.post("/v1/favorite-list", isAuth, getListFavorite);
router.post("/v1/favorite-profile", isAuth, getListFavoriteProfile);
router.post("/v1/related-list", isAuth, getRelatedCampaign);
router.post("/v1/detail", isAuth, getDetailsCampaign);
router.post("/v1/getQuiz", isAuth, getQuiz);
router.get("/v1/all", isAuth, getAll);
router.post("/v1/category", isAuth, getByCategory);
router.post("/v1/branch", isAuth, getByBranch);
router.post("/v1/location", isAuth, getByCounterpart);
router.post("/v1/search", isAuth, searchCampaign);
router.post("/v1/update-status", isAuth, updateCampaignStatus);
router.post("/v1/delete-user-join", isAuth, deleteUsersJoinCampaign);
module.exports = router;
