var webpack = require("webpack")

module.exports = {
    entry: "./index.js",
    output: {
        path: "./dist",
        publicPath: "dist/",
        filename: "build.js"
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compressor: {
        //         warnings: false
        //     }
        // })
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: "babel",
            query: {
                presets: ["es2015"]
            }
        }]
    }
}
