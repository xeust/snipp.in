const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

module.exports = {
  chainWebpack: (config) => {
    config.module.rules.delete("eslint");
  },
  configureWebpack: {
    // plugins: [new BundleAnalyzerPlugin()],
    plugins: [
      // new BundleAnalyzerPlugin(),
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ["typescript", "javascript", "css", "html", "json", "python", "markdown"],
        features: ['!gotoSymbol'],
      }),
    ],
    optimization: {
      splitChunks: {
        minSize: 100000,
        maxSize: 1000000,
      },
    },
  },
  css: {
    loaderOptions: {
      sass: {
        //   data: `
        //     @import "@/styles/setup/_mixins.scss";
        //   `
      },
    },
  },
  devServer: {
    watchOptions: {
      poll: true,
    },
  },
};
