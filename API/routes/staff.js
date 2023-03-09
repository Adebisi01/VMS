const express = require("express");
const userRouter = express.Router();
const { getAllStaff, getStaff } = require("../controllers/staff");

userRouter.route("/").get(getAllStaff);
userRouter.route("/:id").get(getStaff);

module.exports = userRouter;
