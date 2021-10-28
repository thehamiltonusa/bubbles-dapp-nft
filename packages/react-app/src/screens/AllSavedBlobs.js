import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box, Center, Heading, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import SEO from '../components/SEO';

import Logo from '../components/Common/Logo';
import SavedBlobs from '../components/AllSavedBlobs';
import Layout from '../components/Layout';

const SecondPage = () => (
  <Layout>
    <SEO
      title="Bubbles Minted"
      description="Check all Bubbles minted"
    />
    <Box my="10" textAlign="center">
      <Center>
        <Logo />
      </Center>
      <Heading
        size="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        variant="main"
      >
        Browse all minted bubbles
      </Heading>
      <Center>
        <Link to="/home">
          {' '}
          <ArrowBackIcon />
          Go back to the homepage
        </Link>
      </Center>
    </Box>
    <SavedBlobs />
    <Center>
      <Link to="/home">
        {' '}
        <ArrowBackIcon />
        Go back to the homepage
      </Link>
    </Center>
  </Layout>
);

export default SecondPage;
