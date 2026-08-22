module.exports = function (api) {
  api.cache(false); // Force cache invalidation!
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
