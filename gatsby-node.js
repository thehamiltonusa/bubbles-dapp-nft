/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
exports.onCreateWebpackConfig = ({ actions, stage, plugins }) => {

  if (stage === 'build-javascript' || stage === 'develop') {
    actions.setWebpackConfig({
      plugins: [
        plugins.provide({
          process: 'process/browser',
          Buffer: 'buffer/'
         })
      ]
    })
  }
  actions.setWebpackConfig({
    resolve: {
       fallback: {
         os: require.resolve("os-browserify/browser"),
         https :require.resolve("https-browserify"),
         http: require.resolve("stream-http"),
         crypto: require.resolve("crypto-browserify"),
         stream: require.resolve("stream-browserify"),
         assert: require.resolve("assert/"),
         constants: require.resolve("constants-browserify"),
         path: require.resolve("path-browserify")
       }
    }
  })
}
