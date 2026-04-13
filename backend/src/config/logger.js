const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    }),
  ),
  transports: [
    // logs to console
    new transports.Console(),
    // logs to file
    new transports.File({
      filename: path.join(__dirname, "../../logs/app.log"),
    }),
  ],
});

module.exports = logger;
