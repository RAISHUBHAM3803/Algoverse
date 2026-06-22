/**
 * Winston Logger
 * Structured production-grade logging for AlgoVerse backend.
 * Replaces raw console.log/error calls across the codebase.
 *
 * Features:
 * - JSON format in production (machine-readable, compatible with log aggregators)
 * - Colorized pretty format in development
 * - Separate error.log file for error-level messages
 * - Combined.log file for all messages
 */

const { createLogger, format, transports } = require("winston");

const { combine, timestamp, printf, colorize, errors, json } = format;

const isDev = process.env.NODE_ENV !== "production";

// Human-readable format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

// Machine-readable JSON format for production (datadog, cloudwatch, etc.)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: isDev ? devFormat : prodFormat,
  defaultMeta: { service: "algoverse-api" },
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Do not crash on unhandled logger errors
  exitOnError: false,
});

module.exports = logger;
