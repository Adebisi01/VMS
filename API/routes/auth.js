const express = require("express");
const app = express();
const router = express.Router();

//controllers import
const { home, login, registration } = require("../controllers/auth");

router.post("/login", login);
router.post("/sign-up", registration);

module.exports = router;
