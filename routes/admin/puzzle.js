const express = require("express");
const {
  createPuzzle,
  getAllPuzzle,
  updatePuzzle,
} = require("../../controllers/admin/puzzle");
const { isAuth, authRole } = require("../../middlewares/auth");

const router = express.Router();
router.get("/", isAuth, authRole("Admin"), getAllPuzzle);
router.post("/", isAuth, authRole("Admin"), createPuzzle);
router.put("/", isAuth, authRole("Admin"), updatePuzzle);

module.exports = router;
