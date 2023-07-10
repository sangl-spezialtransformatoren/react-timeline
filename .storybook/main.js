const workerLoader = function (source) {
  console.log(source);
  return `export default "Test"`;
};
module.exports = {
  "stories": ["../src/**/*.stories.@(js|jsx|ts|tsx)", "../src/hooks/*.stories.@(js|jsx|ts|tsx)"],
  "addons": ["@storybook/addon-links", "@storybook/addon-essentials"],
  "framework": {
    name: "@storybook/react-webpack5",
    options: {}
  },
  "staticDirs": ["../workers"],
  webpackFinal: async config => {
    config.devtool = 'inline-source-map';
    return config;
  },
  docs: {
    autodocs: false
  }
};