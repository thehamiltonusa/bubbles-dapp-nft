/* eslint-disable react/jsx-one-expression-per-line */
import { Box, Link, Text } from '@chakra-ui/react';
import React from 'react';

const Credits = () => (
  <Box>
    <Text textAlign="center" variant="subtle">
      Sound effects obtained from{' '}
      <Link color="primary" to="https://www.zapsplat.com">
        https://www.zapsplat.com
      </Link>
    </Text>
    <Text textAlign="center" variant="subtle">
      Frontend code obtained from{' '}
      <Link color="primary" to="https://github.com/lokesh-coder/blobs.app">
        https://github.com/lokesh-coder/blobs.app
      </Link>
    </Text>
  </Box>
);

export default Credits;
