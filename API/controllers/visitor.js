require("dotenv").config();
const express = require("express");
const { conn } = require("../models/db");
const { currentTime, currentDate } = require("./variables");
const { getQueryString, getTableType } = require("./utilities");
const jwt = require("jsonwebtoken");
// Registration Controllers
const registerVisitor = (req, res) => {
  let {
    fullname,
    gender,
    status,
    host,
    affiliate,
    purpose,
    image,
    email,
    phone,
    badge,
  } = req.body;
  badge = badge || "none";
  if (!fullname || !gender || !host || !affiliate || !image || !purpose) {
    return res
      .status(400)
      .json({ msg: "Please provide values for all compulsory fields" });
  }
  status = status || "unexpected";
  conn.query(
    "SELECT email, id FROM visitors WHERE email =? AND date=? ORDER BY id DESC",
    [email, currentDate],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      // console.log(result);

      if (result.length > 0) {
        let token = jwt.sign(
          { email, visitId: result[0].id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        return res.status(409).json({
          msg: "You Already Checked In. Check Out At The Dashboard",
          token,
        });
      } else {
        conn.query(
          `INSERT INTO visitors (fullname, gender,email, phone, purpose, status, checked_in, host, affiliate, badge, image, date) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            fullname,
            gender,
            email.toLowerCase(),
            phone,
            purpose,
            status,
            currentTime,
            host,
            affiliate,
            badge,
            image,
            currentDate,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            let token = jwt.sign(
              { visitId: result.insertId },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );
            if (err) {
              console.log(err);
              return res.status(400).json({ msg: "Registration Failed" });
            }
            return res.status(201).json({ msg: "Visitor Created", token });
          }
        );
      }
    }
  );
};
const expectedVisitorReg = (req, res) => {
  const { fullname, gender, visitorType, email, phone, affiliate } = req.body;
  if (!fullname || !gender || !visitorType || !email || !phone || !affiliate) {
    return res
      .status(400)
      .json({ msg: "Please provide values for all compulsory fields" });
  }
  let currentDate = new Date().toLocaleDateString();
  let currentTime = new Date().toLocaleTimeString();
  conn.query(
    "INSERT INTO expected_visitors (fullname, gender, visitor_type, email, phone, affiliate, host, date) VALUES(?,?,?,?,?,?,?,?,?)",
    [
      fullname,
      gender,
      visitorType,
      email.toLowerCase(),
      phone,
      affiliate,
      req.user.userId,
      currentDate,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Registration Failed. Please try again" });
      }
      return res.status(201).json({ msg: "Expected Visitor Created" });
    }
  );
};
const regularVisitorReg = (req, res) => {
  const { fullname, gender, email, phone, affiliate, host } = req.body;
  if (!fullname || !gender || !email || !phone || !affiliate || !host) {
    return res
      .status(400)
      .json({ msg: "Please provide values for all compulsory fields" });
  }
  conn.query(
    "SELECT email FROM regular_visitor WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length > 0) {
        return res.status(409).json({ msg: "Regular User Already Exist" });
      } else {
        conn.query(
          "INSERT INTO regular_visitor (fullname, gender, email, phone, affiliate, host ) VALUES(?,?,?,?,?,?)",
          [fullname, gender, email.toLowerCase(), phone, affiliate, host],
          (err, result) => {
            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ msg: "Registration Failed. Please try again" });
            }
            return res.status(201).json({ msg: "Regular Visitor Created" });
          }
        );
      }
    }
  );
};

// Fetching Controllers
//Fetch all visitors controller
const getAllVisitors = (req, res) => {
  if (!req.params.type) {
    req.params.type = "general";
  }
  const { type: visitorType } = req.params;
  const tableType = getTableType(visitorType);
  try {
    conn.query(`SELECT * FROM ${tableType} ORDER BY id DESC`, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ msg: "Request failed, Please provide a valid visitor type" });
      }
      res
        .status(200)
        .json({ msg: "successful", data: result, count: result.length });
    });
  } catch (error) {
    return res
      .status(200)
      .json({ msg: "Something went wrong please try again" });
  }
};

//Fetching one visitors controllers
const getVisitor = (req, res) => {
  const { id: visitorId, type: visitorType } = req.params;
  const tableType = getTableType(visitorType);

  conn.query(
    `SELECT * FROM ${tableType} WHERE id =?`,
    [visitorId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          msg: "Request failed, Please check you request parameters if they are valid",
        });
      }
      if (result.length == 0) {
        return res.status(404).json({ msg: "Cannot find this visitor" });
      }
      return res
        .status(200)
        .json({ msg: "Successful", data: result[0], count: result.length });
    }
  );
};

const updateVisitor = (req, res) => {
  const { id: visitorId, type: visitorType } = req.params;
  const tableType = getTableType(visitorType);
  const queryString = getQueryString(req.body);

  conn.query(
    `UPDATE ${tableType} SET ${queryString} WHERE id=?`,
    [visitorId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          msg: "Request failed, Please check you request parameters if they are valid",
        });
      }
      res.status(200).json({ msg: "Vistor Updated" });
    }
  );
};
const deleteVisitor = (req, res) => {
  const { id: visitorId, type: visitorType } = req.params;
  const tableType = getTableType(visitorType);

  conn.query(
    `DELETE FROM ${tableType} WHERE id=?`,
    [visitorId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          msg: "Request failed, Please check you request parameters if they are valid",
        });
      }
      res.status(200).json({ msg: "Vistor Deleted" });
    }
  );
};

const searchVisitor = (req, res) => {
  const { table, key, value, today } = req.body;
  if (!table || !key || !value) {
    return res
      .status(400)
      .json({ msg: "Please Provide All Required Parameters" });
  }

  conn.query(
    `SELECT * FROM ${table} WHERE ${key}=? ${
      today ? ` AND date = ${currentDate} ` : ""
    } ORDER BY id DESC LiMIT 1`,
    [value],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "Something Went Wrong, Try Again" });
      }
      if (result.length === 0) {
        return res.status(200).json({
          msg: "Cannot Find Any Result For This Request",
          data: result,
        });
      }
      return res.status(200).json({ msg: "Request Successful", data: result });
    }
  );
};
const isCheckedIn = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "Please Provide An Email Address" });
  }

  conn.query(
    `SELECT * FROM visitors WHERE email=? AND date=? ORDER BY id DESC LiMIT 1`,
    [email, currentDate],
    (err, result) => {
      if (err) {
        console.log(err);

        return res.status(500).json({ msg: "Something Went Wrong, Try Again" });
      }
      if (result.length === 0) {
        let checkedIn = false;
        let checkedOut = false;
        return res.status(200).json({
          msg: "Cannot Find Any Result For This Request",
          data: result,
          checkedIn,
          checkedOut,
        });
      }
      const checkedOut = !result[0].checked_out ? false : true;
      return res.status(200).json({
        msg: "Request Successful",
        data: result,
        checkedIn: true,
        checkedOut,
      });
    }
  );
};

module.exports = {
  registerVisitor,
  expectedVisitorReg,
  regularVisitorReg,
  getAllVisitors,
  getVisitor,
  updateVisitor,
  deleteVisitor,
  searchVisitor,
  isCheckedIn,
};
