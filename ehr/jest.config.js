module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|@react-native-async-storage|react-native-reanimated|react-native-linear-gradient|react-native-worklets)/)',
  ],
};
