require("dotenv").config();

const jwt = require("jsonwebtoken");
const { conn } = require("../models/db");

const authMiddleware = (req, res, next) => {
  const reqHeader = req.headers.authorization;
  if (!reqHeader || !reqHeader.startsWith("Bearer")) {
    return res
      .status(401)
      .json({ msg: "You are not authorised to view this page" });
  }
  try {
    let token = reqHeader.split(" ")[1];
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    conn.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {
        if (!result || err) {
          return res.status(401).json({ msg: "User does not exist" });
        }
        const { id: userId, email: userEmail, role: userRole } = result[0];
        req.user = { userId, userEmail, userRole };
        next();
      }
    );
  } catch (error) {
    return res.status(401).json({ msg: "Invalid Authentication Token" });
  }
};
module.exports = { authMiddleware };
