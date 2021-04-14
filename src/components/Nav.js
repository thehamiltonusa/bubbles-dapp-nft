import {
  Button,
  Box,
  Center,
  HStack,
  Text,
  Link,
  useToast,
} from '@chakra-ui/react';
import React from 'react';
import { Link as GatbsyLink } from 'gatsby';
import { SavedIcon, TwitterIcon, BookmarkIcon } from './Common/Icons';
import { dynamic } from '../state';

const NavLinks = (props) => {
  const toast = useToast();
  return (
    <Box px="10" pt="3">
      <Center>
        <HStack spacing="0.2px" fontSize="sm">

          <Box as={Text}>
            <Button
              href="/saved-blobs/"
              as={GatbsyLink}
              to="/saved-blobs"
              variant="heavy"
              leftIcon={<SavedIcon fontSize="18px" />}
              aria-label="My minted bubbles"
            >
              My Bubbles
            </Button>
          </Box>
          <Box as={Text}>
            <Button
              href="/all-saved-blobs/"
              as={GatbsyLink}
              to="/all-saved-blobs"
              variant="heavy"
              leftIcon={<SavedIcon fontSize="18px" />}
              aria-label="Minted bubbles"
            >
              All Bubbles
            </Button>
          </Box>
          <Box as={Text} sm="none">
          {
            (
              !props.loading ?
              (
                 !props.coinbase ?
                 (
                   <Button
                     px={2}
                     py={1}
                     rounded={'md'}
                     onClick={props.connectWeb3}
                     >
                     <b>Connect Web3</b>
                   </Button>
                 ) :
                 (
                   <>{' '}<small>Web3 connected</small>{' '}</>
                 )
              ) :
              (
                <>{' '}<small>Connecting ...</small>{' '}</>
              )
            )
          }
          </Box>
        </HStack>

      </Center>
    </Box>
  );
};

export default dynamic(NavLinks);
