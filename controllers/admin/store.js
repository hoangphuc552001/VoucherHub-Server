const Store = require("../../models/store");

exports.getStore = async (req, res) => {
  try {
    const result = await Store.find({ counterpartID: req.params.id });

    res.status(200).send({
      success: true,
      message: "Get a store successfully",
      stores: result,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
