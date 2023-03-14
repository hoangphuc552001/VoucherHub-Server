const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: String,
    role: {
      type: String,
      required: true,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password is required");
  try {
    return await bcrypt.compare(password, this.password);
  } catch (e) {
    console.log(e);
    return false;
  }
};

userSchema.statics.inThisEmailInUse = async function (email) {
  if (!email) throw new Error("Email is required");
  try {
    const user = await this.findOne({ email });
    return !user;
  } catch (e) {
    console.log(e);
    return false;
  }
};
module.exports = mongoose.model("User", userSchema);
