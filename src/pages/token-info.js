import * as React from 'react';
import { Link } from 'gatsby';

import { Box, Center, Heading, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import SEO from '../components/SEO';

import Logo from '../components/Common/Logo';
import Layout from '../components/Layout';
import TokenInfo from '../components/TokenInfo';
const SecondPage = () => (
  <Layout>
    <SEO
      title="TokenInfo"
      description="Bubbles as NFT"
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
        Browse minted blobs
      </Heading>
      <Text my="2" variant="subtle">
        Click on the any blob card to navigate to token info
      </Text>
    </Box>
    <TokenInfo />
    <Center>
      <Link to="/all-saved-blobs">
        {' '}
        <ArrowBackIcon />
        Go back to tokens page
      </Link>
    </Center>
  </Layout>
);

export default SecondPage;
