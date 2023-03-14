const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  counterpartID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Counterpart",
    required: true,
  },
});
module.exports = mongoose.model("Employee", employeeSchema);
