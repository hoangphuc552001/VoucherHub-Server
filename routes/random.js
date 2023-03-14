const express = require('express');
const router = express.Router();
const {isAuth} = require("../middlewares/auth");
const {
    getRandomNumberBaseOnUniswap,
    callRandomGenerationFunction,
    getRandomNumberBaseOnChainlink,
    checkRandomNumber
} = require("../scripts/getRandomNumber");

router.get('/uniswap', isAuth, (req, res) => {
    try {
        getRandomNumberBaseOnUniswap().then((x) => {
            res.send({success: true, message: x})
        });
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
});

router.get('/chainlink', isAuth, async (req, res) => {
    try {
        const signChecking = await callRandomGenerationFunction()
        const setTimer = setInterval(async () => {
            const rs = await checkRandomNumber(signChecking);
            console.log(rs)
            if (rs.fulfilled) {
                clearInterval(setTimer);
                const randomNumber = await getRandomNumberBaseOnChainlink(signChecking);
                res.send({success: true, message: randomNumber});
            }
        }, 10000)

    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
})

module.exports = router;
