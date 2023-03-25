const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    title: {
      type: String,
    },
    seen: {
      type: Boolean,
    },
    all: {
      type: Boolean,
    },
    campaignID: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Notification", notificationSchema);
