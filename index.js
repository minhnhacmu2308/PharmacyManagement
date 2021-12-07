import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./routers/User.js";
// import Task from "./routers/Task.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URL;

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());
app.use(express.static("public"));
app.use("/admin", User);
// app.use("/user/task", Task);

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connect Successfully!!!");
    app.listen(PORT, () => {
      console.log("Server running !!!!! ");
    });
  })
  .catch((err) => {
    console.log(err);
  });
