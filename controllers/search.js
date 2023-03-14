const Campaign = require("../models/campaign");
const Store = require("../models/store");
const Employee = require("../models/employee");
const Payment = require("../models/payment");
const dayjs = require("dayjs");

exports.searchCampaign = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let campaigns = await Campaign.find({
      $and: [
        { counterpartID: req.counterpartID },
        {
          name: new RegExp(keyword, "i"),
        },
      ],
    }).lean();

    campaigns.sort((a, b) => dayjs(b.updatedAt).diff(dayjs(a.updatedAt)));
    const x = campaigns.map((item) => ({
      ...item,
      remainingVoucher: item.vouchers.reduce((pre, x) => pre + x.amount, 0),
    }));

    res.status(200).send({
      success: true,
      message: "Search campaigns successfully",
      campaigns: x,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchStore = async (req, res) => {
  try {
    let stores = [];
    const keyword = req.query.keyword;
    stores = await Store.find({
      $and: [
        { counterpartID: req.counterpartID },
        {
          title: new RegExp(keyword, "i"),
        },
      ],
    });
    console.log(stores);
    res.status(200).send({
      success: true,
      message: "Search stores successfully",
      stores,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchEmployee = async (req, res) => {
  try {
    let employees = [];
    const keyword = req.query.keyword;
    employees = await Employee.find({
      $and: [
        { counterpartID: req.counterpartID },
        {
          $or: [
            {
              employeeID: new RegExp(keyword, "i"),
            },
            {
              name: new RegExp(keyword, "i"),
            },
            {
              phone: new RegExp(keyword, "i"),
            },
            {
              email: new RegExp(keyword, "i"),
            },
          ],
        },
      ],
    });
    res.status(200).send({
      success: true,
      message: "Search employees successfully",
      employees,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.searchPayment = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const campaigns = await Campaign.find({
      counterpartID: req.counterpartID,
    }).populate({
      path: "paymentID",
      match: {
        $and: [
          { counterpartID: req.counterpartID },
          {
            paymentID: new RegExp(keyword, "i"),
          },
        ],
      },
    });
    const payments = campaigns
      .filter((item) => item.paymentID !== null)
      .map((item) => {
        return {
          _id: item.paymentID._id.toString(),
          paymentID: item.paymentID.paymentID,
          price: item.paymentID.price,
          status: item.paymentID.status,
          accountID: item.paymentID.accountID,
          campaignName: item.name,
          createdAt: item.createdAt,
        };
      });
    payments.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

    res.status(200).send({
      success: true,
      message: "Search payments successfully",
      payments,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
