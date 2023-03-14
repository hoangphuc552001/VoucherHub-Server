const mongoose = require("mongoose");

const userWin = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    code: {
      type: String,
    },
  },
  { timestamps: true }
);
const piecesDetail = new mongoose.Schema(
  {
    quantity: {
      type: Number,
    },
    remaningQuantity: {
      type: Number,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const puzzleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    dateBegin: {
      type: String,
    },
    dateEnd: {
      type: String,
    },
    status: {
      type: String,
    },
    userWin: [userWin],
    pieces: [piecesDetail],
  },
  { timestamps: true }
);
module.exports = mongoose.model("puzzle", puzzleSchema);
