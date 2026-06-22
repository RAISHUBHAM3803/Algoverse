const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Set environment variables for tests globally before imports
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-very-long-string-12345";
process.env.JWT_EXPIRE = "15m";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-very-long-string-12345";
process.env.JWT_REFRESH_EXPIRE = "7d";
process.env.AI_PROVIDER = "mock";
process.env.JDOODLE_MOCK = "true";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.MONGO_URI = "mongodb://dummy:27017/test";

let mongoServer;

// Increase timeout for downloading MongoDB binaries if needed
jest.setTimeout(300000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

