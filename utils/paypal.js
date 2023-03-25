const fetch = require("node-fetch");
const io = require("../app");
const Campaign = require("../models/campaign");
const Counterpart = require("../models/counterpart");
const Notification = require("../models/notification");
const Payment = require("../models/payment");
const { CLIENT_ID, APP_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

async function createOrder(value) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: value,
          },
        },
      ],
    }),
  });
  const data = await response.json();
  return data;
}

async function capturePayment(orderId, counterpartID, campaignID) {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    const object = {
      paymentID: data.id,
      email: data.payment_source.paypal.email_address,
      price: data.purchase_units[0].payments.captures[0].amount.value,
      status: data.purchase_units[0].payments.captures[0].status,
      accountID: data.payment_source.paypal.account_id,
      counterpartID: counterpartID,
    };
    const payment = new Payment(object);
    const result = await payment.save();

    // emit noti through admin
    if (campaignID) {
      if (data.purchase_units[0].payments.captures[0].status === "COMPLETED") {
        const campaign = await Campaign.findOne({ _id: campaignID });
        const counterpart = await Counterpart.findOne({ _id: counterpartID });
        const newNoti = new Notification({
          image: campaign.image,
          title: "Check Out",
          description: `${counterpart.nameOfShop} has been checked out ${data.purchase_units[0].payments.captures[0].amount.value}`,
          all: false,
          seen: false,
          campaignID: campaign._id,
          userID: "63c0df555c82e28ff69f8a5b",
        });
        const noti = await newNoti.save();
        io.emit("Admin", {
          _id: noti._id,
          userID: "63c0df555c82e28ff69f8a5b",
          title: "Check Out",
          description: `${counterpart.nameOfShop} has been checked out ${data.purchase_units[0].payments.captures[0].amount.value}`,
        });
      }
      await Campaign.updateOne({ _id: campaignID }, { paymentID: result._id });
    }
    return data;
  } catch (e) {
    console.log(e);
  }
}

async function generateAccessToken() {
  const response = await fetch(base + "/v1/oauth2/token", {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization:
        "Basic " + Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64"),
    },
  });

  const data = await response.json();
  return data.access_token;
}

module.exports.createOrder = createOrder;
module.exports.capturePayment = capturePayment;
