const dayjs = require("dayjs");
const Campaign = require("../models/campaign");
const Userjoin = require("../models/userjoin");
const Voucher = require("../models/voucher");
const {
  getTotalVoucher,
  getTotalCampaign,
  getCustomer,
  filterDate,
  filterUser,
} = require("../utils/statistic");

const templateData = [
  {
    label: "Campaigns",
    description: "Total campaigns which you created",
  },
  {
    label: "Customers",
    description: "Total customer who participated in",
  },
  {
    label: "Release Vouchers",
    description: "Total vouchers which users got ",
  },
  {
    label: "Used Vouchers",
    description: "Total vouchers which users used ",
  },
];

exports.getGeneralStatistic = async (req, res) => {
  try {
    const option = req.params.option;
    let campaignResult, customerResult, releaseResult, usedResult;
    usedResult = await getTotalVoucher(option, req.counterpartID, false);
    releaseResult = await getTotalVoucher(option, req.counterpartID, true);
    campaignResult = await getTotalCampaign(
      option,
      req.counterpartID,
      "Counterpart"
    );
    customerResult = await getCustomer(
      option,
      req.counterpartID,
      "Counterpart"
    );

    for (const element of templateData) {
      if (element.label === "Campaigns") {
        element.value = campaignResult.value;
        element.percentage = campaignResult.percentage;
      } else if (element.label === "Customers") {
        element.value = customerResult.value;
        element.percentage = customerResult.percentage;
      } else if (element.label === "Release Vouchers") {
        element.value = releaseResult.value;
        element.percentage = releaseResult.percentage;
      } else if (element.label === "Used Vouchers") {
        element.value = usedResult.value;
        element.percentage = usedResult.percentage;
      }
    }
    res.status(201).send({
      result: templateData,
      success: true,
      message: "Voucher created successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getVoucherStatistic = async (req, res) => {
  try {
    const list = await Voucher.find({
      $and: [
        { campaign: req.body.option },
        { createAt: { $gte: req.body.startDate, $lt: req.body.endDate } },
      ],
    });

    const result = filterDate(list, req.body.startDate, req.body.endDate);

    res.status(201).send({
      result: [
        Object.values(result.usedVouchers),
        Object.values(result.releaseVouchers),
      ],
      success: true,
      message: "Get vouchers statistic successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getGameStatistic = async (req, res) => {
  try {
    const id = req.params.id;
    const campaignList = await Voucher.find({ campaign: id });

    const data = { 2048: 0, Fly: 0, Shake: 0, Quiz: 0 };
    for (let item of campaignList) {
      if (data[item.game] >= 0) {
        data[item.game] += 1;
      }
    }
    res.status(201).send({
      result: Object.values(data),
      success: true,
      message: "Get vouchers statistic successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getDiscountStatistic = async (req, res) => {
  try {
    const id = req.params.id;
    const campaignList = await Voucher.find({ campaign: id });

    const result = {};
    for (let item of campaignList) {
      if (result[item.discount]) {
        result[item.discount] += 1;
      } else {
        result[item.discount] = 1;
      }
    }
    res.status(201).send({
      result: [Object.keys(result), Object.values(result)],
      success: true,
      message: "Get discount statistic successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getUserStatistic = async (req, res) => {
  try {
    const list = await Userjoin.find({
      $and: [
        { campaignID: req.body.option },
        { createdAt: { $gte: req.body.startDate, $lt: req.body.endDate } },
      ],
    });

    const result = filterUser(list, req.body.startDate, req.body.endDate);

    res.status(201).send({
      result: Object.values(result),
      success: true,
      message: "Get user statistic successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
