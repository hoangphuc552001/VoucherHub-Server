const express = require("express");
const paypal = require("../utils/paypal");
const router = express.Router();
const { isAuth } = require("../middlewares/auth");
const Payment = require("../models/payment");
const Campaign = require("../models/campaign");
const dayjs = require("dayjs");

router.post("/", async (req, res) => {
  const order = await paypal.createOrder(req.body.fee);
  res.json(order);
});

router.get("/", isAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      counterpartID: req.counterpartID,
    }).populate("paymentID");
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
      message: "Get all invoices successfully",
      payments,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
});

router.post("/:orderID/capture", isAuth, async (req, res) => {
  const { orderID } = req.params;
  const captureData = await paypal.capturePayment(
    orderID,
    req.counterpartID,
    ""
  );
  res.json(captureData);
});

router.post("/:orderID/capture/:campaignID", isAuth, async (req, res) => {
  const { orderID, campaignID } = req.params;
  const captureData = await paypal.capturePayment(
    orderID,
    req.counterpartID,
    campaignID
  );
  res.json(captureData);
});

module.exports = router;
