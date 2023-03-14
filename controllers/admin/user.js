const User = require("../../models/user");

exports.getAllUser = async (req, res) => {
  try {
    try {
      const users = await User.find();
      const x = users
        .filter((item) => item.role !== "Admin")
        .map((item) => {
          const { _id, fullName, avatar, email, role, isBlock } = item;
          if (role !== "Admin") {
            return {
              _id,
              fullName,
              avatar,
              email,
              role,
              isBlock,
            };
          }
        });
      res.status(200).send({
        success: true,
        message: "Get all users successfully",
        users: x,
      });
    } catch (e) {
      console.log(e);
      res.status(400).send({ success: false, message: e.message });
    }
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.body.id },
      { isBlock: req.body.isBlock === "true" }
    );
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, message: e.message });
  }
};
