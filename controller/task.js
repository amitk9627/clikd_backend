const Tasks = require("../model/task.js");

const uploadGoogleSheet = async (req, res) => {
  res.json({
    status: true,
    message: "uploaded successfully",
  });
};
const addTask = async (req, res) => {
  res.json({
    status: true,
    message: "uploaded successfully",
  });
};
const getTask = async (req, res) => {
  res.json({
    status: true,
    message: "uploaded successfully",
  });
};
const updateTask = async (req, res) => {
  res.json({
    status: true,
    message: "uploaded successfully",
  });
};
const deleteTask = async (req, res) => {
  res.json({
    status: true,
    message: "uploaded successfully",
  });
};

module.exports = {
  uploadGoogleSheet,
  addTask,
  getTask,
  updateTask,
  deleteTask,
};
