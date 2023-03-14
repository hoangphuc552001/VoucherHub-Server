const express = require("express");
const { isAuth } = require("../middlewares/auth");
const { createCategory, getAllCategory } = require("../controllers/category");
const router = express.Router();

router.post("/add", isAuth, createCategory);
router.get("/", isAuth, getAllCategory);
module.exports = router;
