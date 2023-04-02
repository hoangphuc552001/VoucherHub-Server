const Campaign = require("../models/campaign");
const Counterpart = require("../models/counterpart");
const User = require("../models/user");
const Favorite = require("../models/favorite");
const Quiz = require("../models/quiz");
const Voucher = require("../models/voucher");
const Category = require("../models/category");
const dayjs = require("dayjs");
const Notification = require("../controllers/notification");
const Payment = require("../models/payment");
const socket = require("../app");
const NotificationSchema = require("../models/notification");
const { isAuth } = require("../middlewares/auth");
const userjoin = require("../models/userjoin");
exports.createCampaign = async (req, res) => {
  try {
    req.body.counterpartID = req.counterpartID;
    req.body.vouchers = JSON.parse(req.body.vouchers);
    if (req.body.gameID === "") {
      req.body.gameID = null;
    }
    const payment = await Payment.findOne({ paymentID: req.body.paymentID });
    if (payment) {
      req.body.paymentID = payment._id;
    } else {
      req.body.paymentID = null;
    }
    const campaign = new Campaign(req.body);
    await campaign.save();

    // emit notification through admin
    const counterpart = await Counterpart.findOne({ _id: req.counterpartID });
    const newNoti = new NotificationSchema({
      image: req.body.image,
      title: "Create Campaign",
      description: `${counterpart.nameOfShop} has been created`,
      all: false,
      seen: false,
      campaignID: campaign._id,
      userID: "63c0df555c82e28ff69f8a5b",
    });
    const result = await newNoti.save();
    socket.emit("Admin", {
      _id: result._id,
      userID: "63c0df555c82e28ff69f8a5b",
      title: "Create Campaign",
      description: `${counterpart.nameOfShop} has been created a campaign`,
    });
    res
        .status(201)
        .send({ success: true, message: "Campaign created successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.createCampaignForMobile = async (req, res) => {
  try {
    const userID = req.user._id;
    const category = await Category.find({ name: req.body.category });
    if (category.length <= 0)
      return res
          .status(400)
          .send({ success: false, message: "Category not found" });
    req.body.category = category[0]._id;
    const campaign = new Campaign(req.body);
    await Notification.addNoti(
        userID,
        campaign.image,
        "New Campaign",
        campaign.name,
        false,
        campaign._id
    );
    await campaign.save();
    res
        .status(201)
        .send({ success: true, message: "Campaign created successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getPopularBranch = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
        .limit(5)
        .sort({ totalDonation: -1 });
    res.status(200).send({
      success: true,
      message: "Get popular branch successfully",
      campaigns,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { userID, campaignID } = req.body;
    const user = await User.findById(userID);
    const campaign = await Campaign.findById(campaignID);
    if (!user && !campaign)
      return res
          .status(400)
          .send({ success: false, message: "User or campaign not found" });
    const checkExist = await Favorite.findOne({ userID, campaignID });
    if (checkExist) {
      await Favorite.deleteOne({ userID, campaignID });
      return res.status(200).send({
        success: true,
        message: "Delete favorite successfully",
      });
    }
    await Favorite.create({ userID, campaignID });
    return res.status(200).send({
      success: true,
      message: "Add favorite successfully",
    });
  } catch (e) {
    return res.status(400).send({ success: false, message: e.message });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const { userID, campaignID } = req.body;
    const user = await User.findById(userID);
    const campaign = await Campaign.findById(campaignID);
    if (!user && !campaign)
      return res
          .status(400)
          .send({ success: false, message: "User or campaign not found" });
    await Favorite.deleteOne({ userID, campaignID });
    res.status(200).send({
      success: true,
      message: "Remove favorite successfully",
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getNewestCampaign = async (req, res) => {
  try {
    let campaigns = await Campaign.find({status:"HAPPENING"}).limit(5).sort({ createdAt: -1 });
    let newCampaigns = [];
    for (let i = 0; i < campaigns.length; i++) {
      const objectAddress = await Counterpart.findById(
          campaigns[i].counterpartID
      );
      const address = objectAddress.headquarter;
      const shop = objectAddress.nameOfShop;
      const imageShop = objectAddress.image;
      const newObject = {
        ...campaigns[i]._doc,
        address,
        shop,
        imageShop,
      };
      newCampaigns.push(newObject);
    }
    campaigns = newCampaigns;
    res.status(200).send({
      success: true,
      message: "Get newest campaign successfully",
      campaigns,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    let isRequest = false;
    let campaigns = await Campaign.find({
      counterpartID: req.counterpartID,
    }).lean();
    campaigns.sort((a, b) => dayjs(b.updatedAt).diff(dayjs(a.updatedAt)));
    const x = campaigns.map((item) => ({
      ...item,
      remainingVoucher: item.vouchers.reduce((pre, x) => pre + x.amount, 0),
    }));

    if (isRequest) {
      campaigns = await Campaign.find({ counterpartID: req.counterpartID });
    }

    res.status(200).send({
      success: true,
      message: "Get all campaigns successfully",
      campaigns: x,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getOneCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id }).populate({
      path: "counterpartID",
    });

    if (campaign.paymentID) {
      const payment = await Payment.findOne({
        counterpartID: req.counterpartID,
      });
      campaign.paymentID = payment;
    }
    if (campaign.counterpartID.userID.valueOf() === req.user._id.valueOf()) {
      res.status(200).send({
        success: true,
        message: "Get a campaign successfully",
        campaign,
      });
    } else {
      res.status(400).send({
        success: true,
        message: "You dont't have permisstion to get a campaign",
        campaign,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    delete req.body.paymentID;
    req.body.vouchers = JSON.parse(req.body.vouchers);
    req.body.message = "";
    if (!req.body.gameID || req.body.gameID === "null") {
      delete req.body.gameID;
    }
    const campaign = await Campaign.find({
      $and: [{ userID: req.user._id }, { _id: req.body._id }],
    }).updateOne(req.body);

    // update campaign
    const counterpart = await Counterpart.findOne({ _id: req.counterpartID });
    const newNoti = new NotificationSchema({
      image: req.body.image,
      title: "Updated Campaign",
      description: `${counterpart.nameOfShop} has been updated a campaign`,
      all: false,
      seen: false,
      campaignID: campaign._id,
      userID: "63c0df555c82e28ff69f8a5b",
    });
    const result = await newNoti.save();
    socket.emit("Admin", {
      _id: result._id,
      userID: "63c0df555c82e28ff69f8a5b",
      title: "Updated Campaign",
      description: `${counterpart.nameOfShop} has been updated a campaign`,
    });
    res.status(200).send({
      success: true,
      message: "Update a campaign successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.deleteUsersJoinCampaign = async (req, res) => {
  try {
    await userjoin.deleteMany({});
    res.status(200).send({
      success: true,
      message: "Delete users join campaign successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateCampaignStatus = async (req, res) => {
  try {
    const { campaignID, status } = req.body;
    console.log(campaignID, status);
    if (!campaignID || !status)
      return res
          .status(400)
          .send({ success: false, message: "Missing params" });
    await Campaign.findById(campaignID).updateOne({ status });
    res.status(200).send({
      success: true,
      message: "Update a campaign successfully",
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.deleteMultipleCampaign = async (req, res) => {
  try {
    const listID = Object.values(req.query);
    await Campaign.find({
      $and: [{ _id: { $in: listID } }, { userID: req.user._id }],
    }).deleteMany();
    res.status(200).send({
      success: true,
      message: "Delete a campaign's list successfully",
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.deleteSingleCampaign = async (req, res) => {
  try {
    await Campaign.find({
      $and: [{ userID: req.user._id }, { _id: req.params.id }],
    }).deleteOne();
    res.status(200).send({
      success: true,
      message: "Delete a campaign successfully",
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getListFavorite = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(500).json({
        success: false,
        message: "Get failed",
      });
    const favoriteList = await Favorite.find({
      userID: user._id,
    }).select("-_id campaignID");
    const favorite = favoriteList.map((doc) => doc.campaignID);
    return res.status(200).json({
      success: true,
      message: "Get success",
      favorite,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Add failed",
    });
  }
};

exports.getListFavoriteProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(500).json({
        success: false,
        message: "Failed",
      });
    const favorite_ = await Favorite.find({
      userID: user._id,
    });
    const result = favorite_.map((doc) => doc.campaignID);
    const favorite = [];
    for (let i = 0; i < result.length; i++) {
      const object = await Campaign.findById(result[i]);
      favorite.push(object);
    }
    return res.status(200).json({
      success: true,
      message: "Success",
      favorite,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
    });
  }
};

exports.getRelatedCampaign = async (req, res) => {
  try {
    const { campaignID } = req.body;
    if (!campaignID)
      return res
          .status(400)
          .send({ success: false, message: "Campaign not found" });
    const campaign = await Campaign.find({status:"HAPPENING"});
    let list = [];
    for (let i = 0; i < campaign.length; i++) {
      if (campaign[i]._id.valueOf() !== campaignID.valueOf()) {
        list.push(campaign[i]);
      }
    }
    list = list.sort((a, b) => 0.5 - Math.random());
    list = list.slice(0, 5);
    return res.status(200).send({
      success: true,
      message: "Get list related campaign successfully",
      list,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getDetailsCampaign = async (req, res) => {
  try {
    const { campaignID } = req.body;
    if (!campaignID)
      return res
          .status(400)
          .send({ success: false, message: "Campaign not found" });
    let campaign = await Campaign.findById(campaignID);
    if (!campaign)
      return res
          .status(400)
          .send({ success: false, message: "Campaign not found" });
    const counterpart = await Counterpart.findById(campaign.counterpartID);
    const address = counterpart.headquarter;
    const shop = counterpart.nameOfShop;
    const imageShop = counterpart.image;
    const vouchers = await Voucher.find({
      campaign: campaign._id,
    });
    const remainingVoucher = campaign.numberOfVoucher - vouchers.length;
    const turns = await userjoin.find({
      campaignID: campaign._id,
      userID: req.user._id,
    });
    const remainingTurn = 3 - turns.length;
    campaign = {
      ...campaign._doc,
      address,
      shop,
      imageShop,
      remainingVoucher,
      remainingTurn,
    };
    return res.status(200).send({
      success: true,
      message: "Get details campaign successfully",
      campaign,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { campaignID } = req.body;
    if (!campaignID)
      return res
          .status(400)
          .send({ success: false, message: "Campaign not found" });
    const campaign = await Campaign.findById(campaignID);
    if (!campaign)
      return res
          .status(400)
          .send({ success: false, message: "Campaign not found" });
    const quiz = await Quiz.findById(campaign.gameID);
    if (!quiz)
      return res
          .status(400)
          .send({ success: false, message: "Quiz not found" });
    return res.status(200).send({
      success: true,
      message: "Get quiz successfully",
      data: quiz.questions,
    });
  } catch (e) {
    return res.status(400).send({ success: false, message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const campaigns = await Campaign.find({status:"HAPPENING"});
    return res.status(200).send({
      success: true,
      message: "Get all campaign successfully",
      campaigns,
    });
  } catch (e) {
    return res.status(400).send({ success: false, message: e.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category)
      return res
          .status(400)
          .send({ success: false, message: "Category not found" });
    if (category === "All") {
      const list = await Campaign.find({status:"HAPPENING"});
      return res.status(200).send({
        success: true,
        message: "Get campaign by category successfully",
        list,
      });
    }
    const catFinding = await Category.find({ name: category });
    if (catFinding.length <= 0)
      return res
          .status(400)
          .send({ success: false, message: "Category not found" });
    console.log(catFinding[0]._id);
    const list = await Campaign.find({ category: catFinding[0]._id });
    console.log(list);
    return res.status(200).send({
      success: true,
      message: "Get campaign by category successfully",
      list,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ success: false, message: e.message });
  }
};

exports.getByBranch = async (req, res) => {
  try {
    const { branch } = req.body;
    if (!branch)
      return res
          .status(400)
          .send({ success: false, message: "Branch not found" });
    const counterpart = await Counterpart.find({
      nameOfShop: branch,
      status:"HAPPENING"
    });
    if (counterpart.length <= 0)
      return res
          .status(400)
          .send({ success: false, message: "Branch not found" });
    const list = await Campaign.find({
      counterpartID: counterpart[0]._id,
    });
    return res.status(200).send({
      success: true,
      message: "Get campaign by branch successfully",
      list,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ success: false, message: e.message });
  }
};

exports.getByCounterpart = async (req, res) => {
  try {
    const { counterpartID } = req.body;
    if (!counterpartID)
      return res
          .status(400)
          .send({ success: false, message: "Counterpart not found" });
    const list = await Campaign.find({
      counterpartID,
      status:"HAPPENING"
    });
    return res.status(200).send({
      success: true,
      message: "Get campaign by counterpart successfully",
      list,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchCampaign = async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword)
      return res
          .status(400)
          .send({ success: false, message: "Keyword not found" });
    const listCounterpart = await Counterpart.find({status:"HAPPENING"});
    const counterpart = listCounterpart.filter((item) =>
        item.nameOfShop.toLowerCase().includes(keyword.toLowerCase())
    );
    if (counterpart.length <= 0)
      return res
          .status(400)
          .send({ success: false, message: "Keyword not found" });
    const list = await Campaign.find({
      counterpartID: counterpart[0]._id,
    });
    return res.status(200).send({
      success: true,
      message: "Search campaign successfully",
      list,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ success: false, message: e.message });
  }
};
