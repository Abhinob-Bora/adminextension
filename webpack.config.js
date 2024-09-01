const path = require('path'); // Use CommonJS require syntax

module.exports = {
  mode: 'production', // Change to 'production' for production builds
  entry: {
    background: './src/background.js', // Entry point for background script
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: '[name].bundle.js', // Output filename will be 'background.js'
  },
  plugins: [
  ],
  module: {
    rules: [
      {
        test: /\.js$/, // Apply the loader to all JavaScript files
        exclude: /node_modules/, // Exclude node_modules directory
        use: {
          loader: 'babel-loader', // Use babel-loader for transpiling JavaScript files
          options: {
            presets: ['@babel/preset-env'], // Use @babel/preset-env for targeting specific environments
          },
        },
      },
    ],
  },
  // devtool: 'source-map',
  resolve: {
    extensions: ['.js'], // Add support for importing JavaScript files without extension
  },
};
