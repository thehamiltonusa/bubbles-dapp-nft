import {
  Button,
  Box,
  Center,
  HStack,
  Text,
  Link,
  useToast,
  Spinner
} from '@chakra-ui/react';
import React from 'react';
import { Link as GatbsyLink } from 'gatsby';
import { SavedIcon, TwitterIcon, BookmarkIcon } from './Common/Icons';
import { dynamic } from '../state';

const NavLinks = ({ saveBlob,mint,coinbase,connectWeb3,loading,minting }) => {
  const toast = useToast();
  return (
    <Box px="10" pt="3">
      <Center>
        <HStack spacing="2px" fontSize="sm">
          <Box as={Text}>
            {
              (
                coinbase ?
                (
                  !minting ?
                  (
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
                        if(await mint()){
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
                        }

                      }}
                    >
                      Mint
                    </Button>
                  ):
                  (
                    <Spinner />
                  )
                ) :
                (
                  loading ?
                  (
                    <Spinner />
                  ) :
                  (
                      <Button
                        px={2}
                        py={1}
                        rounded={'md'}
                        onClick={() => {connectWeb3()}}
                        >
                        <b>Connect Wallet</b>
                      </Button>
                  )
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
