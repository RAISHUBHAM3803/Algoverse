const { Worker } = require("bullmq");
const redis = require("../config/redis");
const submissionService = require("../services/submissionService");
const logger = require("../utils/logger");

// Redis publisher for SSE notifications (separate connection from the consumer)
const publisher = redis.duplicate();
publisher.on("error", (err) => logger.error(`[Worker] Redis publisher error: ${err.message}`));

const submissionWorker = new Worker("submissions", async (job) => {
  logger.info(`[Worker] Processing submission job ${job.id}`);
  const { userId, problemId, language, code } = job.data;

  try {
    const result = await submissionService.submitCode(userId, problemId, language, code);
    await publisher.publish(`job:${job.id}:complete`, JSON.stringify(result));
    return result;
  } catch (error) {
    logger.error(`[Worker] Job ${job.id} processing error: ${error.message}`);
    await publisher.publish(`job:${job.id}:error`, JSON.stringify({ success: false, error: error.message }));
    throw error; // Re-throw so BullMQ marks the job as failed and triggers retries
  }
}, { connection: redis });

// 'completed' event fires after the processor resolves — no need to log again here
submissionWorker.on("failed", (job, err) => {
  logger.error(`[Worker] Job ${job.id} permanently failed: ${err.message}`);
});

// Handle internal BullMQ/Redis errors to prevent UnhandledEventEmitter rejections
submissionWorker.on("error", (err) => {
  logger.error(`[Worker] Internal error: ${err.message}`);
});

module.exports = submissionWorker;
