const express = require("express");
const {
  uploadGoogleSheet,
  addTask,
  getTask,
  updateTask,
  deleteTask,
} = require("../controller/task.js");
const router = express.Router();

router.post("/import", uploadGoogleSheet);
router.get("/tasks", getTask);
router.post("/tasks", addTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

module.exports = router;
