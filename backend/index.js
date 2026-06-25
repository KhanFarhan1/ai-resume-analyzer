require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();
const authRoute = require("./route/auth");

const PORT = process.env.PORT || 8080;
const url = process.env.DB_URL;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);

async function main() {
  await mongoose.connect(url);
}
main()
  .then(() => {
    console.log("DBconnected Successfully");
    app.listen(PORT, () => {
      console.log(`App is listening on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
