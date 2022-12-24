const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = require("./app");

const port = process.env.PORT || 5000;

const db = process.env.MONGODB_URI.replace(
  "<password>",
  process.env.DB_PASSWORD
);
mongoose.set("strictQuery", false);
mongoose.connect(db, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to MongoDB");
  }
});

app.listen(port, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running on port: ${port}`);
  }
});
