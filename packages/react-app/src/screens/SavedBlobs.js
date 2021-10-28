import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box, Center, Heading, Text } from '@chakra-ui/react';
import { ArrowBackIcon,ArrowForwardIcon } from '@chakra-ui/icons';
import SEO from '../components/SEO';

import Logo from '../components/Common/Logo';
import SavedBlobs from '../components/SavedBlobs';
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
        Browse minted bubbles
      </Heading>
      <Center>
        <Link to="/home">
          {' '}
          <ArrowBackIcon />
          Homepage
        </Link>
        {'\u00A0\u00A0\u00A0\u00A0\u00A0'}
        <Link to="/all-saved-blobs">
          {' '}
          All bubbles page
          <ArrowForwardIcon />
        </Link>
      </Center>
    </Box>
    <SavedBlobs />
    <Center>
      <Link to="/home">
        {' '}
        <ArrowBackIcon />
        Homepage
      </Link>
      {'\u00A0\u00A0\u00A0\u00A0\u00A0'}
      <Link to="/all-saved-blobs">
        {' '}
        All bubbles page
        <ArrowForwardIcon />
      </Link>
    </Center>
  </Layout>
);

export default SecondPage;
