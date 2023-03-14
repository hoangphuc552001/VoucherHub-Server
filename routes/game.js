const express = require("express");
const {
  createGame,
  getOnceGame,
  updateGame,
  createQuiz,
  getOnceQuiz,
  getAllQuiz,
  updateQuiz,
  getAllGame,
} = require("../controllers/game");
const { isAuth, isCounterpart } = require("../middlewares/auth");
const router = express.Router();

router.post("/collection", isAuth, createQuiz);
router.put("/collection", isAuth, isCounterpart, updateQuiz);
router.get("/collection/:id", isAuth, getOnceQuiz);
router.get("/collection", isAuth, isCounterpart, getAllQuiz);

module.exports = router;
