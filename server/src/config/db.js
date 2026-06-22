/**
 * MongoDB Connection Configuration
 * Handles database connection with event listeners and automatic retries
 */

const mongoose = require("mongoose");
const config = require("./index");
const logger = require("../utils/logger");

let isConnecting = false;

const connectDB = async (retries = 5, delay = 5000) => {
  if (isConnecting) return;
  isConnecting = true;

  // Register connection lifecycle events (only once)
  mongoose.connection.on("connected", () => {
    logger.info("✅ MongoDB Connected Successfully.");
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB Connection Error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("⚠️ MongoDB Disconnected.");
  });

  for (let i = 0; i < retries; i++) {
    try {
      logger.info(`Connecting to MongoDB (Attempt ${i + 1}/${retries})...`);
      await mongoose.connect(config.mongoUri, {
        // [S3/DB5 FIX] Disable autoIndex in production to prevent startup write-locks
        autoIndex: config.mongoAutoIndex,
        // [PERF FIX] Connection pool sized via config for load tuning
        maxPoolSize: config.mongoPoolSize,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      isConnecting = false;
      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        logger.info(`Waiting ${delay / 1000}s before retrying...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  isConnecting = false;
  logger.error("Failed to connect to MongoDB after maximum retries. Exiting process.");
  process.exit(1);
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("✅ MongoDB Disconnected");
  } catch (error) {
    logger.error(`MongoDB Disconnection Error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };


