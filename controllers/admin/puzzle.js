const Puzzle = require("../../models/puzzle");
const dayjs = require("dayjs");
exports.createPuzzle = async (req, res) => {
  try {
    const pieceImg = [];
    const quantityTemp = req.body.quantity.split(",");
    const imgTemp = req.body.image.split(",");
    for (let i = 1; i <= 9; i++) {
      pieceImg[i - 1] = {
        quantity: parseInt(quantityTemp[i - 1]),
        image: imgTemp[i - 1],
        remaningQuantity: parseInt(quantityTemp[i - 1]),
      };
    }

    let puz = {
      title: req.body.title,
      dateBegin: req.body.dateBegin,
      dateEnd: req.body.dateEnd,
      image: imgTemp[9],
      pieces: pieceImg,
    };
    if (dayjs().isAfter(dayjs(req.body.dateBegin))) {
      puz.status = "HAPPENING";
    } else {
      puz.status = "CREATED";
    }
    const puzzle = new Puzzle(puz);
    await puzzle.save();
    res
      .status(201)
      .send({ success: true, message: "Puzzle created successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getAllPuzzle = async (req, res) => {
  try {
    const puzzles = await Puzzle.find();
    res.status(201).send({
      success: true,
      puzzles: puzzles,
      message: "Puzzle created successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updatePuzzle = async (req, res) => {
  try {
    const pieceImg = [];
    const quantityTemp = req.body.quantity.split(",");
    const imgTemp = req.body.image.split(",");
    for (let i = 1; i <= 9; i++) {
      pieceImg[i - 1] = {
        quantity: parseInt(quantityTemp[i - 1]),
        image: imgTemp[i - 1],
        remaningQuantity: parseInt(quantityTemp[i - 1]),
      };
    }
    req.body.pieces = pieceImg;
    req.body.image = imgTemp[9];
    delete req.body.quantity;
    delete req.body.dateEnd;
    delete req.body.dateBegin;
    await Puzzle.find({ _id: req.body._id }).updateOne(req.body);
    res.status(200).send({
      success: true,
      message: "Update a puzzle successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
