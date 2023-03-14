const Campaign = require("../../models/campaign");
const Store = require("../../models/store");
const Employee = require("../../models/employee");
const User = require("../../models/user");
const Counterpart = require("../../models/counterpart");
const Payment = require("../../models/payment");
const puzzle = require("../../models/puzzle");

exports.searchCampaign = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let nameOfShopX;
    if (keyword.length === 0) {
      nameOfShopX = new RegExp(".*", "i");
    } else {
      nameOfShopX = new RegExp(keyword, "i");
    }
    let campaigns = await Campaign.find({ name: nameOfShopX }).lean();
    let campaignsX = await Campaign.find()
      .populate({
        path: "counterpartID",
        match: { nameOfShop: nameOfShopX },
      })
      .lean();
    if (keyword.length === 0) {
      campaigns = campaigns.filter((item) => item.counterpartID != null);
      const x = campaigns.map((item) => ({
        ...item,
        remainingVoucher: item.vouchers.reduce((pre, x) => pre + x.amount, 0),
      }));
      return res.status(200).send({
        success: true,
        message: "Search campaigns successfully",
        campaigns: x,
      });
    } else {
      for (let i = 0; campaignsX.length > i; i++) {
        let coincide = false;
        for (let j = 0; campaigns.length > j; j++) {
          if (campaigns[j]._id.toString() === campaignsX[i]._id.toString()) {
            coincide = true;
          }
        }
        if (!coincide) {
          campaigns.push(campaignsX[i]);
        }
      }
      campaigns = campaigns.filter((item) => item.counterpartID != null);
      const x = campaigns.map((item) => ({
        ...item,
        remainingVoucher: item.vouchers.reduce((pre, x) => pre + x.amount, 0),
      }));
      return res.status(200).send({
        success: true,
        message: "Search campaigns successfully",
        campaigns: x,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchUser = async (req, res) => {
  try {
    let users = [];
    const keyword = req.query.keyword;
    users = await User.find({
      $or: [
        {
          fullName: new RegExp(keyword, "i"),
        },
        {
          email: new RegExp(keyword, "i"),
        },
      ],
    });
    res.status(200).send({
      success: true,
      message: "Search users successfully",
      users,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchCounterpart = async (req, res) => {
  try {
    let counterparts = [];
    const keyword = req.query.keyword;
    counterparts = await Counterpart.find({
      $or: [
        {
          nameOfShop: new RegExp(keyword, "i"),
        },
        {
          phone: new RegExp(keyword, "i"),
        },
        {
          headquarter: new RegExp(keyword, "i"),
        },
      ],
    });
    res.status(200).send({
      success: true,
      message: "Search counterparts successfully",
      counterparts,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchPayment = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const campaigns = await Campaign.find().populate({
      path: "paymentID",
      match: {
        $or: [
          {
            email: new RegExp(keyword, "i"),
          },
          {
            accountID: new RegExp(keyword, "i"),
          },
          {
            paymentID: new RegExp(keyword, "i"),
          },
        ],
      },
    });
    let payments = campaigns
      .filter((item) => item.paymentID !== null)
      .map((item) => {
        return {
          _id: item.paymentID._id.toString(),
          email: item.paymentID.email,
          accountID: item.paymentID.accountID,
          paymentID: item.paymentID.paymentID,
          price: item.paymentID.price,
          status: item.paymentID.status,
          accountID: item.paymentID.accountID,
          campaignName: item.name,
        };
      });
    res.status(200).send({
      success: true,
      message: "Search counterparts successfully",
      payments,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchPuzzle = async (req, res) => {
  try {
    let puzzles = [];
    const keyword = req.query.keyword;
    puzzles = await puzzle.find({
      title: new RegExp(keyword, "i"),
    });
    res.status(200).send({
      success: true,
      message: "Search counterparts successfully",
      puzzles,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
