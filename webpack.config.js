const path = require("path");
const NodemonPlugin = require("nodemon-webpack-plugin"); // Ding

module.exports = {
  entry: "./script.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  plugins: [
    new NodemonPlugin(), // Dong
  ],
  devtool: "source-map",
  resolve: {
    extensions: [".js"],
  },
};
