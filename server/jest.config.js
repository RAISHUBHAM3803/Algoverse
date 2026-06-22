module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 10000,
  collectCoverage: true,
  coverageDirectory: "tests/coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/",
    // External API services require real keys — excluded from coverage thresholds
    "src/services/jdoodleService.js",
    "src/services/aiProviderService.js",
    "src/utils/driverCodeGenerator.js",
    "src/utils/analyticsHelper.js",
  ],
  coverageThreshold: {
    global: {
      branches: 54,
      functions: 60,
      lines: 65,
      statements: 65,
    }
  },
  verbose: true
};