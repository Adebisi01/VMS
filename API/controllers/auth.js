require("dotenv").config();
const express = require("express");
const { conn } = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Function to manipulate passwords
const hash = async (password) => {
  password = await bcrypt.hash(password, saltRounds);
  return password;
};
const compare = async (password, dbPassword) => {
  const result = await bcrypt.compare(password, dbPassword);
  return result;
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query Database for user credentials
    conn.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {
        if (err || result[0] == undefined) {
          console.log("Could not fetch data");
          return res.status(400).json({ msg: "Invalid credentials" });
        }
        const {
          password: dbPassword,
          first_name: firstName,
          last_name: lastName,
        } = result[0];

        if (!(await compare(password, dbPassword))) {
          res.status(400).json({ msg: "Invalid credentials" });
        } else {
          // generate jwt token
          const token = jwt.sign(
            { email, name: `${firstName} ${lastName}` },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );
          res.status(200).json({ msg: "Login Successfull", token });
        }
      }
    );
  } catch (error) {
    res.status(404).json({ msg: "Invalid Credentials" });
  }
};

// Registering users
const registration = async (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res
      .status(400)
      .json({ msg: "please provide values for all fields" });
  }
  let hashPassword = await hash(password);
  try {
    //check if email already exists
    conn.query(
      "SELECT email FROM users WHERE email=?",
      [email],
      (err, result) => {
        if (result.length > 0) {
          return res
            .status(403)
            .json({ msg: "A User With This Email Already exist" });
        } else {
          //insert if it does not exist
          conn.query(
            "INSERT INTO users (first_name, last_name, email, password) VALUES(?,?,?,?)",
            [firstName, lastName, email, hashPassword],
            (err, result) => {
              if (err) {
                console.log(err);
              }
              const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: "1d",
              });
              res.status(201).json({ msg: "User Created", token });
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(409).json({ msg: "Registration Failed" });
  }
};
module.exports = { login, registration, compare };
