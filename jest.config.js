module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/async-storage.ts',
    '^expo-camera$': '<rootDir>/src/mocks/expo-camera.web.ts',
  },
};
