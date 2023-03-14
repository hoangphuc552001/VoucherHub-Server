const dayjs = require("dayjs");
const Campaign = require("../../models/campaign");
const Counterpart = require("../../models/counterpart");
const puzzle = require("../../models/puzzle");
const puzzlejoin = require("../../models/puzzlejoin");
const Userjoin = require("../../models/userjoin");
const Voucher = require("../../models/voucher");
const {
  getTotalCampaign,
  getCustomer,
  getCounterpart,
  getAccount,
  filterDate,
  filterUser,
  getIncome,
} = require("../../utils/statistic");

const templateData = [
  {
    label: "Campaigns",
    description: "Total new campaigns",
  },
  {
    label: "Users",
    description: "Total users who participate in campaigns",
  },
  {
    label: "Counterparts",
    description: "Total new counterparts",
  },
  {
    label: "Incomes",
    description: "Total incomes",
  },
];

exports.getGeneralStatistic = async (req, res) => {
  try {
    const option = req.params.option;
    let campaignResult, customerResult, counterpartResult, accountResult;

    campaignResult = await getTotalCampaign(option, req.user._id, "Admin");
    customerResult = await getCustomer(option, req.user._id, "Admin");
    counterpartResult = await getCounterpart(option);
    incomeResult = await getIncome(option);
    for (const element of templateData) {
      if (element.label === "Campaigns") {
        element.value = campaignResult.value;
        element.percentage = campaignResult.percentage;
      } else if (element.label === "Users") {
        element.value = customerResult.value;
        element.percentage = customerResult.percentage;
      } else if (element.label === "Counterparts") {
        element.value = counterpartResult.value;
        element.percentage = counterpartResult.percentage;
      } else if (element.label === "Incomes") {
        element.value = incomeResult.value;
        element.percentage = incomeResult.percentage;
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

exports.getAllVoucherStatistic = async (req, res) => {
  try {
    const list = await Voucher.find({
      createAt: { $gte: dayjs().subtract(9, "day"), $lt: dayjs() },
    });

    const result = filterDate(list, dayjs().subtract(9, "day"), dayjs());
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

exports.getAllUserStatistic = async (req, res) => {
  try {
    const list = await Userjoin.find({
      createdAt: { $gte: dayjs().subtract(9, "day"), $lt: dayjs() },
    });

    const result = filterUser(list, dayjs().subtract(9, "day"), dayjs());

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

exports.getGameStatistic = async (req, res) => {
  try {
    const campaignList = await Voucher.find();
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

exports.getCounterpartStatistic = async (req, res) => {
  try {
    const list = await Counterpart.find({
      createAt: { $gte: req.body.startDate, $lt: req.body.endDate },
    });

    const result = filterUser(list, req.body.startDate, req.body.endDate);

    res.status(201).send({
      result: Object.values(result),
      success: true,
      message: "Get counterparts statistic successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getCampaignStatistic = async (req, res) => {
  try {
    let list;
    if (req.body.status !== "All") {
      if (req.body.typeOfRandom !== "All") {
        list = await Campaign.find({
          $and: [
            { typeOfRandom: req.body.typeOfRandom.toString().toLowerCase() },
            { status: req.body.status.toString().toUpperCase() },
            { createdAt: { $gte: req.body.startDate, $lt: req.body.endDate } },
          ],
        });
      } else {
        list = await Campaign.find({
          $and: [
            { status: req.body.status.toString().toUpperCase() },
            { createdAt: { $gte: req.body.startDate, $lt: req.body.endDate } },
          ],
        });
      }
    } else {
      if (req.body.typeOfRandom !== "All") {
        list = await Campaign.find({
          $and: [
            { typeOfRandom: req.body.typeOfRandom.toString().toLowerCase() },
            { createdAt: { $gte: req.body.startDate, $lt: req.body.endDate } },
          ],
        });
      } else {
        list = await Campaign.find({
          createdAt: { $gte: req.body.startDate, $lt: req.body.endDate },
        });
      }
    }

    const result = filterUser(list, req.body.startDate, req.body.endDate);
    res.status(201).send({
      result: Object.values(result),
      success: true,
      message: "Get campaigns statistic successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getPuzzleStatistic = async (req, res) => {
  try {
    const arr = await puzzlejoin.find({ puzzleID: req.body.id });
    const puz = await puzzle
      .findOne({ _id: req.body.id })
      .populate({ path: "userWin", populate: { path: "userID" } });
    let list = [];
    for (let i = 0; i < puz.userWin.length; i++) {
      list.push({
        name: puz.userWin[i].userID.fullName,
        email: puz.userWin[i].userID.email,
        avatar: puz.userWin[i].userID.avatar,
        code: puz.userWin[i].code,
        createdAt: puz.userWin[i].createdAt,
      });
    }
    let result = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < arr.length; i++) {
      let str = arr[i].pieceType.split("_");
      result[str[1] - 1] += 1;
    }
    res.status(201).send({
      result: { data: Object.values(result), list: list },
      success: true,
      message: "Get campaigns statistic successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
