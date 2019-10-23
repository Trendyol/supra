module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts','!**/__tests__/**/*.d.ts'],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "!lib/**/*.d.ts",
  ]
};
