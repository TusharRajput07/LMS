const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const logger = require("./config/logger");

const authRoutes = require("./routes/auth.routes");
const bookRoutes = require("./routes/book.routes");
const issueRoutes = require("./routes/issue.routes");
const adminRoutes = require("./routes/admin.routes");

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Morgan HTTP request logging via Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Library Management API is running...");
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
