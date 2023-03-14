const Quiz = require("../models/quiz");

exports.createQuiz = async (req, res) => {
  try {
    req.body.questions = JSON.parse(req.body.questions);
    req.body.counterpartID = req.counterpartID;
    const quiz = new Quiz(req.body);
    await quiz.save();
    res
      .status(201)
      .send({ success: true, message: "Quiz created successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    req.body.questions = JSON.parse(req.body.questions);
    await Quiz.updateOne(
      {
        $and: [{ _id: req.body._id }, { counterpartID: req.counterpartID }],
      },
      req.body
    );
    res
      .status(201)
      .send({ success: true, message: "Quiz updated successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getOnceQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      $and: [{ _id: req.params.id }, { counterpartID: req.counterpartID }],
    });
    res.status(200).send({
      success: true,
      message: "Get a quiz successfully",
      quiz,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getAllQuiz = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ counterpartID: req.counterpartID });
    res.status(200).send({
      success: true,
      message: "Get all quizzes successfully",
      quizzes,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.findPointAndDiscount = (point, game) => {
  console.log(point, game);
  let pointRs = 0,
    discountRs = 0;
  for (let i = 0; i < game.length; i++) {
    if (point < game[i].point) {
      if (i - 1 >= 0) {
        pointRs = game[i - 1].point;
        discountRs = game[i - 1].discount;
      } else {
        pointRs = game[i].point;
        discountRs = 0;
      }
      break;
    } else {
      pointRs = game[i].point;
      discountRs = game[i].discount;
    }
  }
  return { pointRs, discountRs };
};
