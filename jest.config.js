module.exports = {
  preset: 'react-native',
  testMatch: ['**/__tests__/**/*.test.tsx', '**/?(*.)+(spec|test).ts?(x)'], // Look for .test.tsx and .spec.tsx files
  testPathIgnorePatterns: ['/node_modules/', '/jest.config.js/'], // Ignore config file itself
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest', // Handle JS and TS files
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js', // Mock image files
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
