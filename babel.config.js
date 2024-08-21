module.exports = {
  presets: [
    'module:metro-react-native-babel-preset', // Use the Metro preset for React Native
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
        '@babel/preset-react',
      ],
    },
  },
};
