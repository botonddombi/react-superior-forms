const mode = process.env.NODE_ENV;
const isDevelopment = (mode == 'development');
const isBeingServed = (process.env.SERVE == 'true');
const isBeingServedForIE11 = isBeingServed && (process.env.IE11 == 'true');
const shouldMinimize = !(isBeingServed || isDevelopment);

const path = require('path');

const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

let additionalPlugins = [];
let output = {};
let entry = {};
let externals = {};
let tsCompilerOptions = {};

if(isBeingServed){
    entry = {
        'demo': './demo/example.tsx',
    };

    tsCompilerOptions = {
        rootDir: ".",
        outDir: "demo/dist"
    };
}
else{
    entry = {
        'main': './src/js/main.ts',
        'main.min': './src/js/main.ts',
    };

    output = {
        ...output,
        library: 'ReactSuperiorForm',
        libraryTarget: 'umd'
    };
    
    externals.react = {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
    };
}

if(isDevelopment || isBeingServed){
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const { CleanWebpackPlugin } = require('clean-webpack-plugin');

    additionalPlugins = [
        ...additionalPlugins,
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'React Superior Forms',
        })
    ];
}

module.exports = {
    mode : isBeingServed ? 'development' : 'production',
    watchOptions : {
        aggregateTimeout : 400,
		ignored: '/node_modules/'
    },
    target: (!isBeingServed || isBeingServedForIE11) ? 'browserslist' : 'web',
    entry,
    externals,
    output : {
        path: path.resolve(__dirname, isBeingServed ? 'demo/dist' : 'lib'),
        filename: 'js/[name].js',
        pathinfo: !shouldMinimize,
        ...output
    },
    module : {
        rules : [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions : tsCompilerOptions
                        }
                    }
                ],
            },
            {
                test: /\.(sass|scss|css)$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: isBeingServed,
                            modules: {
                                localIdentName: 'rsf-[local]'
                            },
                        }
                    },
                    'postcss-loader',
					{
						loader: 'sass-loader',
						options: {
							sassOptions : {
								minimize: shouldMinimize,
								outputStyle: 'expanded'
							}
						}
					}
				]
            }
        ]
	},
    plugins: [
        ...additionalPlugins,
		new StylelintPlugin({
			fix: true,
			files: 'src/**/*.scss',
			emitWarning: true,
		}),
		new ESLintPlugin({
			fix : true,
			extensions: ['ts', 'tsx', 'js'],
			threads: true
		}),
        new MinifyPlugin({}, {
            comments: false,
            sourceMap: true,
            test: /\.min\.js$/
        })
    ],
    cache: {
        type: 'memory'
    },
	stats : {
		assets: false,
		modules: false,

		children: true,
		
		warnings : true,

		errors: true,
		errorDetails: true,
		errorStack: true,
	},
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
		splitChunks: false,
		minimize: shouldMinimize,
		emitOnErrors: false,
    },
    resolve : {
        unsafeCache: false,
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            styles: path.resolve(__dirname, 'src/scss/'),
            modules: path.resolve(__dirname, 'src/js/includes/modules/'),
            constants: path.resolve(__dirname, 'src/js/includes/constants/'),
            typings: path.resolve(__dirname, 'src/js/includes/typings/')
        },
        modules: ['node_modules']
    },
    devtool: isBeingServed ? 'source-map' : 'hidden-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'demo/dist'),
        inline: true,
        compress: true,
        liveReload: true,
        port: 9000,
    },
};