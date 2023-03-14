const express = require("express");
const { getStore } = require("../../controllers/admin/store");
const { isAuth, authRole } = require("../../middlewares/auth");

const router = express.Router();
router.get("/:id", isAuth, authRole("Admin"), getStore);

module.exports = router;
