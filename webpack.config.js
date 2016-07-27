module.expots = {
    entry: "./index.js",
    output: {
        path: "./dist",
        publicPath: "dist/",
        filename: "build.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: "babel",
            exclude: /node_modules/
        }]
    }
}
