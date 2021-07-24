const myFirstWebpackPlugin = require("./src/webpack-plugin/first-plugin");
const path = require('path');
module.exports = {
    entry: path.resolve(__dirname, "src/test-ts.ts"),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    // resolve: {
    //     extensions: []
    // },
    output: {
        filename: "bundle.js"
    },
    plugins: [new myFirstWebpackPlugin()]
};