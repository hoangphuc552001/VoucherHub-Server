const express = require("express");
const {
  createEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  deleteMultipleEmployees,
  changeAllEmployee,
} = require("../controllers/employee");
const { isAuth, isCounterpart } = require("../middlewares/auth");
const router = express.Router();

router.post("/all", isAuth, isCounterpart, changeAllEmployee);
router.post("/", isAuth, isCounterpart, createEmployee);
router.get("/", isAuth, isCounterpart, getAllEmployees);
router.put("/", isAuth, isCounterpart, updateEmployee);
router.delete("/", isAuth, isCounterpart, deleteMultipleEmployees);
router.delete("/:id", isAuth, isCounterpart, deleteEmployee);

module.exports = router;
