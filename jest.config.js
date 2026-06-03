/** Jest configuration. The streak engine is pure TypeScript, so a Node test
 * environment with the jest-expo preset is enough — no native mocking needed. */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
};
