require("dotenv").config();
const mysql = require("mysql");
const conn = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
try {
  conn.connect((err) => {
    if (err) {
      console.log("Connection Failed" + err);
    } else {
      console.log("Mysql Connected");
    }
  });
} catch (error) {
  console.log("Failed to connect to database");
}

module.exports = { conn };
