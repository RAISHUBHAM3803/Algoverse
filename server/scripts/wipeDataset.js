require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');
const Submission = require('../src/models/Submission');
const User = require('../src/models/User');

async function wipeDataset() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/algoverse';
    console.log('Connecting to DB at:', uri.substring(0, 50) + '...');
    await mongoose.connect(uri);
    console.log('Connected.');

    // Delete all problems
    const problemResult = await Problem.deleteMany({});
    console.log(`Deleted ${problemResult.deletedCount} problems.`);

    // Delete all submissions (to avoid orphaned references)
    const submissionResult = await Submission.deleteMany({});
    console.log(`Deleted ${submissionResult.deletedCount} submissions.`);

    // Reset user solved stats
    const userResult = await User.updateMany({}, { 
      $set: { 
        solvedProblems: [], 
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        difficultyStats: { easy: 0, medium: 0, hard: 0 }
      } 
    });
    console.log(`Reset statistics for ${userResult.modifiedCount} users.`);

    console.log('\n✅ Database successfully cleaned! Ready for the new placement dataset.');

  } catch (error) {
    console.error('❌ Error wiping dataset:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

wipeDataset();
