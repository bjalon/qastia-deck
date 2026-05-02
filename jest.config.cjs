module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/jest/**/*.test.mjs"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest/setup.mjs"],
};
