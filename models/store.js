const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    coordinates: {
      type: Object,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    counterpartID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counterpart",
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Store", storeSchema);
