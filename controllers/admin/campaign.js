const dayjs = require("dayjs");
const Campaign = require("../../models/campaign");
const Counterpart = require("../../models/counterpart");
const { addNoti } = require("../notification");
const io = require("../../app");
const Notification = require("../../models/notification");

exports.getAllCampaignsByAdmin = async (req, res) => {
  try {
    try {
      const campaigns = await Campaign.find()
        .populate("counterpartID")
        .populate("gameID")
        .lean();
      let x = campaigns.map((item) => ({
        ...item,
        remainingVoucher: item.vouchers.reduce((pre, x) => pre + x.amount, 0),
      }));
      x = x.sort((a, b) => {
        return b.updatedAt - a.updatedAt;
      });
      res.status(200).send({
        success: true,
        message: "Get all campaigns successfully",
        campaigns: x,
      });
    } catch (e) {
      console.log(e);
      res.status(400).send({ success: false, message: e.message });
    }
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.body.id });
    console.log(campaign);
    console.log(req.body.id);
    if (dayjs().isBefore(campaign.dateBegin)) {
      await Campaign.updateOne({ _id: req.body.id }, { status: "ACCEPTED" });
      await addNoti(
        null,
        campaign.image,
        "New Campaign",
        "New Campaign has been created",
        true,
        null
      );
    } else {
      await Campaign.updateOne({ _id: req.body.id }, { status: "HAPPENING" });
      await addNoti(
        null,
        campaign.image,
        "New Campaign",
        "New Campaign has been happening",
        true,
        req.body.id
      );
    }
    const newNoti = new Notification({
      userID: campaign.counterpartID,
      image: campaign.image,
      title: campaign.name,
      description: campaign.description,
      seen: false,
      all: false,
      campaignID: campaign._id,
    });
    const result = await newNoti.save();
    io.emit(campaign.counterpartID, {
      _id: result._id,
      image: campaign.image,
      title: campaign.name,
      description: campaign.description,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.refuseCampaign = async (req, res) => {
  try {
    await Campaign.updateOne(
      { _id: req.body.id },
      { status: "NOT_ACCEPTED", message: req.body.message }
    );

    const campaign = await Campaign.findOne({ _id: req.body.id });
    const newNoti = new Notification({
      image: campaign.image,
      title: "Refuse Campaign",
      description: `Your campaign has been rejected`,
      all: false,
      campaignID: campaign._id,
      userID: campaign.counterpartID,
    });
    const result = await newNoti.save();
    io.emit(campaign.counterpartID, {
      _id: result._id,
      userID: campaign.counterpartID,
      title: "Refused Campaign",
      description: `Your campaign has been rejected`,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
