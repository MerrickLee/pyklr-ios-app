module.exports = function (api) {
  api.cache(false); // Force cache invalidation!
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin', // Reanimated 4 uses worklets plugin
    ],
  };
};
