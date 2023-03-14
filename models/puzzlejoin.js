const mongoose = require("mongoose");

const puzzleJoinSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        puzzleID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Puzzle",
            required: true,
        },
        pieceID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        pieceType:{
            type: String,
        },
        game: String,
        image:String
    },
    {timestamps: true}
);
module.exports = mongoose.model("PuzzleJoin", puzzleJoinSchema);
