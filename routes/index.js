const express = require("express");
const router = express.Router();
const {
  createUser,
  userSignIn,
  signOut,
  uploadAvatar,
  getProfileUser,
  checkUserExistByEmail,
  getAdminProfile, getProfileUserWithRole, getListUser, getListEmailUser,
} = require("../controllers/user");
const {
  validateUserSignUp,
  userValidationResult,
  validateUserSignIn,
} = require("../middlewares/validation/user");
const { isAuth } = require("../middlewares/auth");

router.post("/register", validateUserSignUp, userValidationResult, createUser);
router.post("/signin", userSignIn);
router.get("/signout", isAuth, signOut);
router.get("/profile", isAuth, getProfileUserWithRole);
router.get("/admin/profile", isAuth, getAdminProfile);
router.get('/getListEmailUser', isAuth, getListEmailUser)
const multer = require("multer");
const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const uploads = multer({ storage, fileFilter });
//avatar
router.post("/upload-profile", isAuth, uploads.single("profile"), uploadAvatar);
router.get("/", (req, res) => {
  res.send("Welcome to the API");
});
router.post("/check-user-exist", isAuth, checkUserExistByEmail);
module.exports = router;
