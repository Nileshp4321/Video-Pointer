const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/auth");
const dotenv = require("dotenv");
const annotationsRoutes = require("./routes/annotationsRoutes");

dotenv.config();
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    if (error.cause) {
      console.error("Cause of the error:", error.cause);
    }
  });

app.use("/api/auth", authRoutes);
app.use("/api", annotationsRoutes);
