const sass = require('rollup-plugin-scss');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      sass({
        output: 'dist/bundle.css',
        sass: require('sass'),
      }),
    );
    return config;
  },
};