const express = require('express');
const {isAuth} = require("../middlewares/auth");
const {addHistory, getAll, deleteAll} = require("../controllers/history");
const router = express.Router();

router.post('/add', isAuth, addHistory);
router.get('/', isAuth, getAll)
router.delete('/delete', isAuth, deleteAll);
module.exports = router;

