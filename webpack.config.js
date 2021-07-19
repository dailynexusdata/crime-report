const path = require("path");

module.exports = {
  entry: "./plots/index.js",
  mode: "production",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
