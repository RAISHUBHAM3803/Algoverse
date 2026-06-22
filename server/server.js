/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 */

require("dotenv").config();

const config = require("./src/config");
const app = require("./src/app");
const { connectDB, disconnectDB } = require("./src/config/db");
const logger = require("./src/utils/logger");
require("./src/workers/submissionWorker"); // Start the BullMQ worker

const PORT = config.port;
const NODE_ENV = config.nodeEnv;


// ============================================
// PROCESS-LEVEL ERROR GUARDS
// ============================================

// Handle uncaught synchronous exceptions — must exit, state is undefined
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", { name: err.name, message: err.message, stack: err.stack });
  process.exit(1);
});

// ============================================
// STARTUP: Connect DB first, then open port
// [S1 FIX] DB must be ready before accepting requests
// ============================================

const startServer = async () => {
  logger.info("========================================");
  logger.info("🚀 AlgoVerse Backend Server Starting...");
  logger.info("========================================");
  logger.info(`📍 Environment: ${NODE_ENV}`);

  // Connect to MongoDB BEFORE opening the HTTP port
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🔗 Server running on: http://localhost:${PORT}`);
    logger.info(`📊 Health Check: http://localhost:${PORT}/health`);
    logger.info("========================================");
    logger.info("✅ Server is ready to accept requests!");
    logger.info("========================================");
  });

  // ============================================
  // GRACEFUL SHUTDOWN HANDLER
  // [S2 FIX] Handle both SIGTERM (Docker/K8s) and SIGINT (Ctrl+C / nodemon)
  // ============================================

  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      logger.info("✅ HTTP server closed — no new connections accepted");

      try {
        await disconnectDB();
        logger.info("✅ MongoDB disconnected cleanly");
      } catch (err) {
        logger.error("Error disconnecting MongoDB", { message: err.message });
      }

      logger.info("👋 Process exiting cleanly");
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error("⚠️ Forced shutdown after timeout");
      process.exit(1);
    }, 10000).unref(); // .unref() prevents this from blocking event loop
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // Docker / K8s
  process.on("SIGINT",  () => gracefulShutdown("SIGINT"));  // [S2 FIX] Ctrl+C / nodemon

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    logger.error("UNHANDLED REJECTION!", { name: err.name, message: err.message });
    if (config.isProduction) {
      // In production: shut down gracefully so the process manager restarts cleanly
      gracefulShutdown("unhandledRejection");
    }
    // In development: just log — do NOT crash, so the dev server stays alive
  });

  return server;
};

startServer().catch((err) => {
  logger.error("Failed to start server", { message: err.message, stack: err.stack });
  process.exit(1);
});

