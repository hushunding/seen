module.exports = {
    entry: {
        "index":"./ViewSeen.ts" // 入口文件可以多个
    },
    output: {
        filename: "[name].js",  // 这里会自动生成index.js
        path:__dirname+"/built" // 输出到哪个文件夹
    },
    resolve: {
         extensions: [".ts",".js"]     // 自动补全，很重要
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: "ts-loader" }   // 使用了ts-loader
        ]
    },
    devtool:'source-map',
};