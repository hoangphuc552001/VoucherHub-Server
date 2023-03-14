const dayjs = require("dayjs");
const Campaign = require("../models/campaign");
const Userjoin = require("../models/userjoin");
const Voucher = require("../models/voucher");
const Counterpart = require("../models/counterpart");
const Store = require("../models/store");
const User = require("../models/user");
const Payment = require("../models/payment");

const getDate = (option) => {
  let firstDateBegin, firstDateEnd, secondDateBegin, secondDateEnd;
  if (option === "today") {
    firstDateBegin = dayjs().set("hour", 0).set("minute", 0).set("second", 0);
    firstDateEnd = dayjs().set("hour", 23).set("minute", 59).set("second", 59);

    secondDateBegin = dayjs()
      .set("date", dayjs().get("date") - 1)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    secondDateEnd = dayjs()
      .set("date", dayjs().get("date") - 1)
      .set("hour", 23)
      .set("minute", 59)
      .set("second", 59);
  } else if (option === "week") {
    let temp = dayjs().get("date") - dayjs().day() + 1;
    firstDateBegin = dayjs()
      .set("date", temp + 1)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    firstDateEnd = dayjs()
      .set("date", temp + 6)
      .set("hour", 23)
      .set("minute", 59)
      .set("second", 59);

    temp = dayjs().get("date") - 7 - dayjs().day() + 1;
    secondDateBegin = dayjs()
      .set("date", temp + 1)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    secondDateEnd = dayjs()
      .set("date", temp + 6)
      .set("hour", 23)
      .set("minute", 59)
      .set("second", 59);
  } else if (option == "month") {
    firstDateBegin = dayjs()
      .set("date", 1)
      .set("month", dayjs().get("month"))
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    firstDateEnd = dayjs()
      .set("date", 31)
      .set("month", dayjs().get("month"))
      .set("hour", 23)
      .set("minute", 59)
      .set("second", 59);

    secondDateBegin = dayjs()
      .set("date", 1)
      .set("month", dayjs().get("month") - 1)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    secondDateEnd = dayjs()
      .set("date", 31)
      .set("month", dayjs().get("month") - 1)
      .set("hour", 23)
      .set("minute", 59)
      .set("second", 59);
  } else if (option == "year") {
    firstDateBegin = dayjs()
      .set("date", 1)
      .set("month", 0)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    firstDateEnd = dayjs()
      .set("date", 31)
      .set("month", 11)
      .set("hour", 23)
      .set("minute", 59)
      .set("second", 59);

    secondDateBegin = dayjs()
      .set("date", 1)
      .set("month", 0)
      .set("year", dayjs().get("year") - 1)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    secondDateEnd = dayjs()
      .set("date", 31)
      .set("month", 11)
      .set("year", dayjs().get("year") - 1)
      .set("hour", 23)
      .set("minute", 59)
      .set("second", 59);
  }
  return [firstDateBegin, firstDateEnd, secondDateBegin, secondDateEnd];
};

const getResult = (a, b) => {
  if (b === 0) return a * 100;
  else if (a === 0) return b * -100;
  const temp = ((b - a) / a) * 100;
  if (Number.isInteger(temp)) {
    return temp;
  }
  return temp.toPrecision(2);
};

exports.filterUser = (list, a, b) => {
  const temp = list.map((item) => ({
    createdAt: item.createdAt,
  }));
  let userCount = {};

  const startDate = dayjs(a).set("hour", 0).set("minute", 0).set("second", 0);
  let endDate = dayjs(b);
  endDate = endDate
    .add(1, "day")
    .set("hour", 0)
    .set("minute", 0)
    .set("second", 0);
  for (var d = startDate; d < endDate; d = d.add(1, "day")) {
    userCount[dayjs(d).format("DD/MM/YYYY")] = 0;
  }
  for (element of temp) {
    const day = dayjs(element.createdAt).format("DD/MM/YYYY");
    if (userCount[day] >= 0) {
      userCount[day] += 1;
    }
  }
  return userCount;
};

exports.getTotalCampaign = async (option, userID, role) => {
  const [firstDateBegin, firstDateEnd, secondDateBegin, secondDateEnd] =
    getDate(option);
  let currentCampaign = 0;
  let pastCampaign = 0;
  if (role === "Admin") {
    currentCampaign = await Campaign.find({
      createdAt: { $gte: firstDateBegin, $lt: firstDateEnd },
    }).count();
    pastCampaign = await Campaign.find({
      createdAt: { $gte: secondDateBegin, $lt: secondDateEnd },
    }).count();
  } else if (role === "Counterpart") {
    currentCampaign = await Campaign.find({
      $and: [
        { counterpartID: userID },
        { createdAt: { $gte: firstDateBegin, $lt: firstDateEnd } },
      ],
    }).count();
    pastCampaign = await Campaign.find({
      $and: [
        { counterpartID: userID },
        { createdAt: { $gte: secondDateBegin, $lt: secondDateEnd } },
      ],
    }).count();
  }

  const result = getResult(currentCampaign, pastCampaign);
  return { value: currentCampaign, percentage: result };
};

exports.getTotalVoucher = async (option, userID, available) => {
  const [firstDateBegin, firstDateEnd, secondDateBegin, secondDateEnd] =
    getDate(option);
  const listCampaign = await Campaign.find({ counterpartID: userID });
  const campaignListID = listCampaign.map((item) => item._id);
  const currentVoucherList = await Voucher.find({
    $and: [
      { campaign: campaignListID },
      { available: available },
      { timeGet: { $gte: firstDateBegin, $lt: firstDateEnd } },
    ],
  }).count();

  const pastVoucherList = await Voucher.find({
    $and: [
      { campaign: campaignListID },
      { available: available },
      { timeGet: { $gte: secondDateBegin, $lt: secondDateEnd } },
    ],
  }).count();

  const result = getResult(currentVoucherList, pastVoucherList);
  return { value: currentVoucherList, percentage: result };
};

exports.getCustomer = async (option, userID, role) => {
  const [firstDateBegin, firstDateEnd, secondDateBegin, secondDateEnd] =
    getDate(option);
  let currentListUser = 0;
  let listCampaignID = [];
  let pastListUser = 0;
  if (role === "Admin") {
    listCampaignID = await Campaign.find({});
    currentListUser = await Userjoin.find({
      createdAt: { $gte: firstDateBegin, $lt: firstDateEnd },
    }).count();
    pastListUser = await Userjoin.find({
      $and: [
        { campaignID: listCampaignID },
        { createdAt: { $gte: secondDateBegin, $lt: secondDateEnd } },
      ],
    }).count();
  } else {
    listCampaignID = await Campaign.find({ counterpartID: userID });
    currentListUser = await Userjoin.find({
      $and: [
        { campaignID: listCampaignID },
        { createdAt: { $gte: firstDateBegin, $lt: firstDateEnd } },
      ],
    }).count();
    pastListUser = await Userjoin.find({
      $and: [
        { campaignID: listCampaignID },
        { createdAt: { $gte: secondDateBegin, $lt: secondDateEnd } },
      ],
    }).count();
  }

  const result = getResult(currentListUser, pastListUser);
  return { value: currentListUser, percentage: result };
};

exports.filterDate = (list, a, b) => {
  const temp = list.map((item) => ({
    available: item.available,
    createdAt: item.createdAt,
  }));
  const startDate = dayjs(a).set("hour", 0).set("minute", 0).set("second", 0);
  let endDate = dayjs(b);

  let usedVouchers = {};
  let releaseVouchers = {};
  endDate = endDate
    .add(1, "day")
    .set("hour", 0)
    .set("minute", 0)
    .set("second", 0);
  for (var d = startDate; d < endDate; d = d.add(1, "day")) {
    usedVouchers[dayjs(d).format("DD/MM/YYYY")] = 0;
    releaseVouchers[dayjs(d).format("DD/MM/YYYY")] = 0;
  }
  for (element of temp) {
    const day = dayjs(element.createdAt).format("DD/MM/YYYY");
    if (usedVouchers[day] >= 0 && !element.available) {
      usedVouchers[day] += 1;
    } else if (releaseVouchers[day] >= 0 && element.available) {
      releaseVouchers[day] += 1;
    }
  }
  return { usedVouchers, releaseVouchers };
};

exports.getIncome = async (option) => {
  const [firstDateBegin, firstDateEnd, secondDateBegin, secondDateEnd] =
    getDate(option);

  const currentPayment = await Payment.find({
    createdAt: { $gte: firstDateBegin, $lt: firstDateEnd },
  });

  const initial = currentPayment.reduce(
    (currentValue, item) => parseFloat(item.price) + currentValue,
    0
  );

  const pastPayment = await Payment.find({
    createdAt: { $gte: secondDateBegin, $lt: secondDateEnd },
  });
  const final = pastPayment.reduce(
    (currentValue, item) => parseFloat(item.price) + currentValue,
    0
  );
  const result = parseInt(getResult(initial, final));

  return { value: "$ " + parseFloat(initial).toFixed(2), percentage: result };
};

exports.getCounterpart = async (option) => {
  const [firstDateBegin, firstDateEnd, secondDateBegin, secondDateEnd] =
    getDate(option);
  const currentCounterpart = await Counterpart.find({
    createdAt: { $gte: firstDateBegin, $lt: firstDateEnd },
  }).count();
  const pastCounterpart = await Store.find({
    createdAt: { $gte: secondDateBegin, $lt: secondDateEnd },
  }).count();
  const result = getResult(currentCounterpart, pastCounterpart);
  return { value: currentCounterpart, percentage: result };
};
