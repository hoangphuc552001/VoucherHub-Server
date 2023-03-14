const mongoose = require("mongoose");
const {addNoti} = require("../controllers/notification");
const voucherSubSchema = new mongoose.Schema(
  {
    discount: Number,
    amount: Number,
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    numberOfVoucher: {
      type: Number,
    },
    message: {
      type: String,
    },
    dateBegin: {
      type: String,
    },
    dateEnd: {
      type: String,
    },
    games: {
      type: Array,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    status: {
      type: String,
    },
    typeOfRandom: {
      type: String,
    },
    counterpartID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counterpart",
      required: true,
    },
    gameID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    paymentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    vouchers: {
      type: [voucherSubSchema],
    },
  },
  { timestamps: true }
);

campaignSchema.pre("updateOne", async function (next) {
    if (this._update.$set && this._update.status) {
        await addNoti(
            null,
             "",
            "New Campaign",
             "New Campaign has been created",
             true,
             null
        )
    }
    next();
});
module.exports = mongoose.model("Campaign", campaignSchema);
