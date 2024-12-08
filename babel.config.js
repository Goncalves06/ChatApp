module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["module:babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      "react-native-reanimated/plugin" // Plugin obrigatório para animações
    ],
  };
};
