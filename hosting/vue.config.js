const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify"],
  // エラー対策：You are using the runtime-only build of Vue
  // https://codewithhugo.com/vue-warn-runtime-only-build/
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [
      // moment.js の肥大化対策
      // https://momentjs.com/docs/#/use-it/webpack/
      new MomentLocalesPlugin({
        localesToKeep: ["es-us", "ja"],
      }),
    ],
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "もーかい";
      return args;
    });
  },
};
