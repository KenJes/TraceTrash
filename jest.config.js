module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "utils/**/*.ts",
    "hooks/**/*.ts",
    "components/**/*.tsx",
    "services/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
  collectCoverage: false,
  coverageDirectory: "coverage",
  testEnvironment: "node",
};
