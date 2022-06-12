require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const mongoose = require("mongoose");
const UserModel = require("./schema/UserSchema");
const TaskModel = require("./schema/TaskSchema");

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/register", async (req, res) => {
  const { username, useremail, password } = req.body;
  const user = await UserModel.findOne({ useremail }).exec();
  if (user) {
    res.status(500);
    res.json({ message: "User already exists" });
  } else {
    await UserModel.create({ username, useremail, password });
    res.json({ message: "success" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(401);
    res.json({ message: "Invalid login" });
    return;
  }
  res.json({ message: "success" });
});

app.post("/task", async (req, res) => {
  const { authorization } = req.headers;
  const [, token] = authorization.split(" ");
  const [username, password] = token.split(":");
  const taskItems = req.body;
  const user = await UserModel.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(403);
    res.json({ message: "Invalid access" });
    return;
  }
  const tasks = await TaskModel.findOne({ userId: user._id }).exec();

  if (!tasks) {
    await TaskModel.create({
      userId: user._id,
      tasks: taskItems,
    });
  } else {
    tasks.tasks = taskItems;
    await tasks.save();
  }
  res.json({
    message: "success",
  });
});

app.get("/task", async (req, res) => {
  const { authorization } = req.headers;
  const [, token] = authorization.split(" ");
  const [username, password] = token.split(":");
  const user = await UserModel.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(403);
    res.json({ message: "Invalid access" });
    return;
  }
  const { tasks } = await TaskModel.findOne({ userId: user._id }).exec();
  res.json(tasks);
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", function () {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
