require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function checkAndFixTestCases() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.\n');

  // Check Two Sum
  const p = await Problem.findOne({ slug: 'two-sum' }).select('+hiddenTestCases').lean();
  console.log('=== Two Sum ===');
  console.log('hiddenTestCases:', JSON.stringify(p.hiddenTestCases));
  console.log('visibleTestCases:', JSON.stringify(p.visibleTestCases));
  console.log('driverCode.cpp exists:', !!p.driverCode?.cpp);
  console.log('driverCode has {{USER_CODE}}:', p.driverCode?.cpp?.includes('{{USER_CODE}}'));
  console.log('driverCode.cpp first 150 chars:', p.driverCode?.cpp?.slice(0, 150));

  mongoose.connection.close();
}

checkAndFixTestCases().catch(console.error);
