const Campaign = require("../../models/campaign");
const Payment = require("../../models/payment");

exports.getAllPayment = async (req, res) => {
  try {
    try {
      const campaigns = await Campaign.find().populate("paymentID");
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
        message: "Get all payments successfully",
        payments: payments,
      });
    } catch (e) {
      console.log(e);
      res.status(400).send({ success: false, message: e.message });
    }
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};
