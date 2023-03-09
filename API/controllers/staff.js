const express = require("express");
const { conn } = require("../models/db");

const getAllStaff = (req, res) => {
  try {
    conn.query("SELECT * FROM users", (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ msg: "Could Not Fetch Users Please Try Again" });
      }
      return res.status(200).json({ msg: "Fetch Successful", data: result });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Something Went Wrong please try again" });
  }
};
const getStaff = (req, res) => {
  const { id: userId } = req.params;
  try {
    conn.query("SELECT * FROM users WHERE id=?", [userId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ msg: "Could Not Fetch Users Please Try Again" });
      }
      return res.status(200).json({ msg: "Fetch Successful", data: result });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Something Went Wrong please try again" });
  }
};

module.exports = { getAllStaff, getStaff };
