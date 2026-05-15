module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  transform: {
    '^.+\\.(ts|js)$': ['jest-preset-angular', {
      useESM: true,
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)',
  ],
  moduleNameMapper: {
    '^.+\\.(html|css|scss)$': '<rootDir>/__mocks__/fileMock.js',
  },
};