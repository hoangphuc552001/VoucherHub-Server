const {isAuth, isCounterpart} = require("../middlewares/auth");
const {changeAllEmployee} = require("../controllers/employee");
const express = require("express");
const router = express.Router();
const Favorite = require("../models/favorite");
router.post("/", isAuth, async (req, res) => {
    try {
        const {userID, campaignID} = req.body;
        console.log(userID, campaignID)
        await Favorite.create({
            userID,
            campaignID
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
});

router.post("/get", isAuth, async (req, res) => {
    try {
        const user = req.user
        if (!user) return res.status(500).json({
            success: false,
            message: "Get failed"
        })
        const favorite = await Favorite.findOne({
            userID: user._id,
        })
        return res.status(200).json({
            success: true,
            message: "Get success",
            favorite
        })

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: "Add failed"
        })
    }
})
