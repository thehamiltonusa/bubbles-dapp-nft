import * as React from 'react';
import { Link } from 'gatsby';

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
      <Logo />
      <Heading
        size="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        variant="main"
      >
        Browse all minted bubbles
      </Heading>
      <Text my="2" variant="subtle">
        Click on the any bubble card to navigate to token info
      </Text>
    </Box>
    <SavedBlobs />
    <Center>
      <Link to="/">
        {' '}
        <ArrowBackIcon />
        Go back to the homepage
      </Link>
    </Center>
  </Layout>
);

export default SecondPage;
