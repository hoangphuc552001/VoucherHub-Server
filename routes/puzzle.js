const express = require('express');
const {isAuth, authRole} = require("../middlewares/auth");
const {addPuzzle, getAll, sendPuzzleFriend, sendPuzzleEveryone} = require("../controllers/puzzle");
const path = require("path");
const {playPuzzle, checkPrize} = require("../controllers/voucher");
const ROLE = require("../scripts/role");
const router = express.Router();

router.post('/add', isAuth, addPuzzle);
router.post('/', isAuth, getAll)
router.post('/send-friend', isAuth, sendPuzzleFriend)
router.post('/send-everyone', isAuth, sendPuzzleEveryone)
router.post('/play', isAuth,playPuzzle);
router.get('/checkPrize',isAuth,checkPrize)

module.exports = router;
