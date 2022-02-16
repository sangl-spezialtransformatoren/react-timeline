const workerLoader = function (source) {
    console.log(source)
    return `export default "Test"`;
}


module.exports = {
    "stories": [
        "../src/**/*.stories.@(js|jsx|ts|tsx)",
        "../src/hooks/*.stories.@(js|jsx|ts|tsx)"
    ],
    "addons": [
        "@storybook/addon-links",
        "@storybook/addon-essentials"
    ],
    "framework": "@storybook/react",
    "staticDirs": [
        "../workers",
    ],
    webpackFinal: async (config, {configType}) => {
        return config;
    },
}