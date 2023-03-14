const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentID: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    price: {
      type: String,
    },
    status: {
      type: String,
    },
    accountID: {
      type: String,
    },
    counterpartID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counterpart",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Payment", paymentSchema);
