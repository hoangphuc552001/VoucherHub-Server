const mongoose = require("mongoose");

const userjoinSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        campaignID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
        },
        game: {
            type: String,
        }
    },
    {timestamps: true}
);
module.exports = mongoose.model("userjoin", userjoinSchema);
