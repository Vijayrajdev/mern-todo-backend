const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: String,
  tasks: [
    {
      checked: Boolean,
      title: String,
      description: String,
    },
  ],
});

const TaskModel = mongoose.model("Tasks", TaskSchema);

module.exports = TaskModel;
