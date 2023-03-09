const express = require("express");
const visitorRouter = express.Router();
const {
  registerVisitor,
  expectedVisitorReg,
  regularVisitorReg,
  getAllVisitors,
  getVisitor,
  updateVisitor,
  deleteVisitor,
  searchVisitor,
  isCheckedIn,
} = require("../controllers/visitor");

//Create visitors
visitorRouter.route("/").post(registerVisitor).get(getAllVisitors);
visitorRouter.route("/expected").post(expectedVisitorReg);
visitorRouter.route("/regular").post(regularVisitorReg);
// Get all Visitors
visitorRouter.route("/:type").get(getAllVisitors);
//Get one and update routes
visitorRouter
  .route("/:type/:id")
  .get(getVisitor)
  .patch(updateVisitor)
  .delete(deleteVisitor);
visitorRouter.route("/search").post(searchVisitor);
visitorRouter.route("/isCheckedIn").post(isCheckedIn);
module.exports = visitorRouter;
