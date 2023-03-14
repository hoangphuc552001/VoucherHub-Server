const express = require("express");

const {isAuth} = require("../middlewares/auth");
const router = express.Router();
const UserJoin = require("../models/userjoin");

router.post("/", isAuth, async (req, res) => {
    try {
        const {userID, campaignID, game} = req.body;
        console.log(userID, campaignID, game)
        await UserJoin.create({
            userID,
            campaignID,
            game
        })
        return res.status(200).json({
            success: true,
            message: "Add success"
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: "Add failed"
        })
    }
})

module.exports = router;
