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

const NavLinks = ({ saveBlob,mint }) => {
  const toast = useToast();
  return (
    <Box px="10" pt="3">
      <Center>
        <HStack spacing="2px" fontSize="sm">
          <Box as={Text}>
            <Button
              variant="heavy"
              style={{
                backgroundColor: "#ffd300"
              }}
              leftIcon={<BookmarkIcon fontSize="18px" />}
              aria-label="Save bubble"
              onClick={async () => {
                localStorage.setItem('blobs',[]);
                saveBlob();
                await mint();
                toast({
                  render: () => (
                    <Box
                      bg="primary"
                      my="10"
                      py="3"
                      px="5"
                      rounded="lg"
                      color="white"
                      textAlign="center"
                      fontWeight="500"
                      shadow="xl"
                    >
                      Bubble Minted!
                    </Box>
                  ),
                  duration: 2000,
                });
              }}
            >
              Mint
            </Button>
          </Box>

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
        </HStack>

      </Center>
      <Center>
        <HStack spacing="2px" fontSize="sm">
          <Box as={Text}>
            <Button
              href="/all-saved-blobs/"
              as={GatbsyLink}
              to="/all-saved-blobs"
              variant="heavy"
              leftIcon={<SavedIcon fontSize="18px" />}
              aria-label="Minted bubbles"
            >
              Minted Bubbles
            </Button>
          </Box>
          <Box as={Text}>
            <Button
              href="http://www.twitter.com/intent/tweet?url=https://uniquebubbles.com/&text=Generate%20and%20mint%20beautiful%20bubbles%20shapes.%20Limit%20of%201000"
              target="_blank"
              as={Link}
              variant="heavy"
              leftIcon={<TwitterIcon fontSize="18px" />}
              aria-label="Share"
            >
              Share
            </Button>
          </Box>
        </HStack>
      </Center>
    </Box>
  );
};

export default dynamic(NavLinks);
