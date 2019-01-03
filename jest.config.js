module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.spec.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/examples/'],
  collectCoverageFrom: ['**/*.ts', '!**/*.gen.ts', '!**/*.d.ts', '!src/index.ts', '!src/types.ts'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
