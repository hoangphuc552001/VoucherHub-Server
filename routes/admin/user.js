const express = require("express");
const { getAllUser, updateUser } = require("../../controllers/admin/user");
const { isAuth, authRole } = require("../../middlewares/auth");

const router = express.Router();
router.get("/", isAuth, authRole("Admin"), getAllUser);
router.post("/", isAuth, authRole("Admin"), updateUser);

module.exports = router;
