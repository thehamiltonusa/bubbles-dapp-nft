import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import { Provider } from 'redux-zero/react';
import { store } from '../state';

import Footer from './Footer';

const Layout = ({ children }) => {
  const theme = useColorModeValue('light', 'dark');

  return (
    <Provider store={store}>
      <Box className={theme}>
        <Container
          maxW="container.xl"
          flex="1"
          display="flex"
          flexDir="column"
          minH="100vh"
        >
          <Box as="main" flex="1" display="flex" flexDir="column">
            {children}
          </Box>
          <Footer siteTitle={'UniqueBubbles'} />
        </Container>
      </Box>
    </Provider>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
