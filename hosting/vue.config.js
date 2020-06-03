const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify"],
  // エラー対策：You are using the runtime-only build of Vue
  // https://codewithhugo.com/vue-warn-runtime-only-build/
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [
      // moment
      new MomentLocalesPlugin({
        localesToKeep: ["es-us", "ja"],
      }),
    ],
  },
};
