const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlLoader = require("html-loader");

module.exports = {
    output: {
        filename: 'highlighter.js',
        libraryTarget: 'umd',
        library: 'Highlighter'
    }
}