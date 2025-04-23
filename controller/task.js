const Tasks = require("../model/task.js");
const axios = require("axios");
const csv = require("csv-parser");

const uploadGoogleSheet = async (req, res) => {
  const sheetURL = req.body.sheetURL;

  try {
    if (!sheetURL) {
      return res.status(400).json({
        status: false,
        message: "URL is invalid or not found",
      });
    }

    const response = await axios.get(sheetURL, { responseType: "stream" });

    const results = [];
    const errors = [];
    let successCount = 0;

    const rows = [];

    response.data
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const title = row.title?.trim();
          const description = row.description?.trim();
          let dueDate = row.dueDate?.trim();

          if (!title || !description || !dueDate) {
            errors.push({
              row,
              error: "Missing required fields: title, description, or dueDate",
            });
            continue;
          }

          try {
            const exists = await Tasks.findOne({ title });
            if (exists) {
              errors.push({
                row,
                error: `Task with title "${title}" already exists`,
              });
              continue;
            }
            const [day, month, year] = dueDate.split("-");
            dueDate = `${year}-${month}-${day}`;

            const task = new Tasks({ title, description, dueDate });
            await task.save();
            results.push(task);
            successCount++;
          } catch (err) {
            errors.push({ row, error: err.message });
          }
        }

        res.status(201).json({
          status: true,
          message: `${successCount} task(s) added successfully.`,
          tasks: results,
          errors,
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Error fetching data from Google Sheets",
    });
  }
};

// const uploadGoogleSheet = async (req, res) => {
//   const sheetURL = req.body.sheetURL;

//   try {
//     if (!sheetURL) {
//       return res.status(400).json({
//         status: false,
//         message: "URL is invalid or not found",
//       });
//     }

//     const response = await axios.get(sheetURL, { responseType: "stream" });

//     const results = [];
//     const errors = [];
//     let successCount = 0;

//     response.data
//       .pipe(csv())
//       .on("data", async (row) => {
//         const title = row.title?.trim();
//         const description = row.description?.trim();
//         const dueDate = row.dueDate?.trim();

//         if (!title || !description || !dueDate) {
//           errors.push({
//             row,
//             error: "Missing required fields: title, description, or dueDate",
//           });
//           return;
//         }

//         const task = new Tasks({ title, description, dueDate });

//         try {
//           await task.save();
//           results.push(task);
//           successCount++;
//         } catch (err) {
//           errors.push({ row, error: err.message });
//         }
//       })
//       .on("end", () => {
//         res.status(201).json({
//           message: `${successCount} task(s) added successfully.`,
//           tasks: results,
//           errors,
//         });
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: false,
//       message: "Error fetching data from Google Sheets",
//     });
//   }
// };

// const uploadGoogleSheet = async (req, res) => {
//   const sheetURL = req.body.sheetURL;
//   try {
//     if (!sheetURL) {
//       return res.status(404).json({
//         status: true,
//         message: "url is invalid or not found",
//       });
//     }
//     const response = await axios.get(sheetURL, { responseType: "stream" });
//     const results = [];
//     response.data
//       .pipe(csv())
//       .on("data", (row) => {
//         let body = {
//           title: row.title,
//           description: row.description,
//           dueDate: roq.dueDate,
//         };
//         results.push(row);
//       })
//       .on("end", () => {
//         console.log(results);
//         res.json(results); // returns the data as JSON
//       });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       status: false,
//       message: "Error fetching data from Google Sheets",
//     });
//   }
// };
const addTask = async (req, res) => {
  const { title, description, dueDate } = req.body;

  try {
    if (!title || !description || !dueDate) {
      return res.status(404).json({
        status: false,
        message: "Missing Field -- title or description or dueDate",
      });
    }
    const exists = await Tasks.findOne({ title });
    if (exists) {
      return res.status(403).json({
        status: false,
        message: "Task Already Added",
      });
    }

    const task = new Tasks({ title, description, dueDate });
    await task.save();
    return res.status(201).json({
      status: true,
      message: "Task Added successfully --",
    });
  } catch (err) {
    return res.status(403).json({
      status: false,
      message: "Error in adding tasks",
      err,
    });
  }
};
const getTask = async (req, res) => {
  try {
    let title = req.query.title;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalTasks = await Tasks.countDocuments();
    const totalPages = Math.ceil(totalTasks / limit);
    let query = {};

    if (title!='') {
      query.title = { $regex: title, $options: "i" };
    }
    const tasks = await Tasks.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalTasks,
      result: tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving tasks",
    });
  }
};
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await Tasks.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    res.status(200).json({
      status: true,
      message: "Task Updated Successfully",
      result: updatedTask,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Error updating task", error });
  }
};
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(404).json({
        status: false,
        message: "id is not found",
      });
    }
    const task = await Tasks.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      deletedTask: task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting task",
    });
  }
};

module.exports = {
  uploadGoogleSheet,
  addTask,
  getTask,
  updateTask,
  deleteTask,
};
