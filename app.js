const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controllers/errorController");
const authRoute = require("./routes/authRoute");
const articleRoutes = require("./routes/articleRoute");

// Global middleware

const allowedOrigins = [
  process.env.FRONTEND_LOCAL_HOST_1,
  process.env.FRONTEND_LOCAL_HOST_2,
  process.env.FRONTEND_LIVE_HOST,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// check development environment

app.use(morgan("dev"));

// test db

// define routes

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/articles", articleRoutes);
// define routes

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// custom error handler middleware start

app.use(globalErrorHandler);
// custom error handler middleware end

module.exports = app;
