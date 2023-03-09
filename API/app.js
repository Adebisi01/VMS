require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const { authMiddleware } = require("./middlewares/auth");
const authRouter = require("./routes/auth");
const visitorRouter = require("./routes/visitor");
const userRouter = require("./routes/staff");

//extra security packages
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//     // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   })
// );
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
// get front end build path and server
const vmsFront = path.join(__dirname, "..", "FRONT-END", "vmsFront", "build");
const vmsAdmin = path.join(__dirname, "..", "FRONT-END", "vms-front1", "build");
app.use(express.static(vmsFront));
app.use(express.static(vmsAdmin));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", authRouter);
app.use("/api/visitor", visitorRouter);
app.use("/api/staffs", userRouter);

// Serve vms front build folder
app.get("/app/*", async (req, res) => {
  res.sendFile(path.join(vmsAdmin, "index.html"));
});
app.get("/*", async (req, res) => {
  res.sendFile(path.join(vmsFront, "index.html"));
});

const port = process.env.PORT || 5000;

const start = () => {
  app.listen(port, () => console.log(`Server listening on port ${port}`));
};

start();
