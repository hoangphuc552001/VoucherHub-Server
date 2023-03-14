const Counterpart = require("../../models/counterpart");

exports.getAllCounterpart = async (req, res) => {
  try {
    try {
      const counterparts = await Counterpart.find();

      res.status(200).send({
        success: true,
        message: "Get all counterparts successfully",
        counterparts: counterparts,
      });
    } catch (e) {
      console.log(e);
      res.status(400).send({ success: false, message: e.message });
    }
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateCounterpart = async (req, res) => {
  try {
    await Counterpart.updateOne(
      { _id: req.body.id },
      { isBlock: req.body.isBlock === "true" }
    );
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
