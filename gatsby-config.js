module.exports = {
  siteMetadata: {
    siteUrl: 'https://uniquebubbles.com',
    name: 'Unique Bubbles',
    description: 'Generate beautiful bubbles as NFT',
    descriptionLong:
      'Mint bubbles. Create random or fixed bubbles, loop, animate, clip and mint them with ease',
    short_name: 'Bubbles NFT generator',
    start_url: '/',
    background_color: '#d7819b',
    theme_color: '#d7819b',
    display: 'minimal-ui',
    icon: 'src/images/blobs.png',
    author: '@',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-offline',
    'gatsby-plugin-image',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Unique Bubbles',
        short_name: 'Bubbles NFT generator',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#d7819b',
        display: 'standalone',
        icon: 'src/images/blobs.png',
      },
    },
    {
      resolve: '@chakra-ui/gatsby-plugin',
      options: {
        isResettingCSS: true,
        isUsingColorMode: true,
        portalZIndex: 40,
      },
    },
  ],
};
