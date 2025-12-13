const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Mock environment variables
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";

process.env.MONGODB_URI = "mongodb://localhost:27017/test-shoppinglist";

// Global mocks
jest.mock("../config/passport", () => ({
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn((strategy, options) => (req, res, next) => next())
}));

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  // Make sure any code that reads MONGODB_URI gets the in-memory URI
  process.env.MONGODB_URI = mongoUri;
  
  // REMOVE the deprecated options
  await mongoose.connect(mongoUri);
  // Or if you need options, use:
  // await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany();
    } catch (error) {
      // Ignore errors if collection doesn't exist
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
