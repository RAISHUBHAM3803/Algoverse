const { Queue } = require("bullmq");
const redis = require("../config/redis");

const submissionQueue = new Queue("submissions", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false, // Keep failed jobs for debugging
    attempts: 3,         // Retry up to 3 times on failure
    backoff: {
      type: "exponential",
      delay: 1000,
    }
  }
});

module.exports = submissionQueue;
