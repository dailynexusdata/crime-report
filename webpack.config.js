const path = require("path");

module.exports = {
  entry: "./plots/index.js",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        // use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
