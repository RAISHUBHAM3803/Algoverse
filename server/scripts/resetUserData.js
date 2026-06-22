require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Submission = require('../src/models/Submission');
const redis = require('../src/config/redis');
const config = require('../src/config');

async function resetData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    console.log('Deleting all submissions...');
    const subResult = await Submission.deleteMany({});
    console.log(`Deleted ${subResult.deletedCount} submissions.`);

    console.log('Resetting user stats...');
    const userResult = await User.updateMany({}, {
      $set: {
        'stats.totalSubmissions': 0,
        'stats.acceptedSubmissions': 0,
        'stats.solvedCount': 0,
        'stats.easySolved': 0,
        'stats.mediumSolved': 0,
        'stats.hardSolved': 0,
        'solvedProblems': []
      }
    });
    console.log(`Reset stats for ${userResult.modifiedCount} users.`);

    console.log('Clearing Redis cache...');
    if (redis && redis.flushall) {
       await redis.flushall();
       console.log('Redis cache cleared.');
    } else {
       console.log('Redis client not available or flushall unsupported.');
    }

    console.log('Data reset complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting data:', err);
    process.exit(1);
  }
}

resetData();
