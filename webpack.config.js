const webpack = require("webpack");
const path = require("path");

const config = {
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	watch: true,
};

module.exports = config;
