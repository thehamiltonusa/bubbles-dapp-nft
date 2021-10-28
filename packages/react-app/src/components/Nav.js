import {
  Button,
  Box,
  Center,
  HStack,
  Text,
  Link,
  useToast,
  Avatar,
} from '@chakra-ui/react';
import React from 'react';
import { Link as GatbsyLink } from 'react-router-dom';
import { SavedIcon, TwitterIcon, BookmarkIcon } from './Common/Icons';
import { dynamic } from '../state';

import makeBlockie from 'ethereum-blockies-base64';

import useWeb3Modal from '../hooks/useWeb3Modal'


const NavLinks = (props) => {
  const toast = useToast();

  return (
    <Box px="10" pt="3">
      <Center>
        <HStack spacing="0.2px" fontSize="sm">

          {
            props.coinbase &&
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
          }
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
              !props.connecting ?
              (
                 !props.coinbase ?
                 (
                   <Button
                     px={2}
                     py={1}
                     rounded={'md'}
                     onClick={props.loadWeb3Modal}
                     >
                     <b>Connect Web3</b>
                   </Button>
                 ) :
                 (
                   <>{' '}
                   <Avatar src={makeBlockie(props.coinbase)} size='sm' />
                   {' '}
                   {
                     (
                       props.netId === 4 ?
                       (
                         <small>RINKEBY</small>
                       ) :
                       (
                         props.netId === 0x64 ?
                         (
                           <small>XDAI</small>
                         ) :
                         props.netId === 0x38 ?
                         <small>BSC</small> :
                         props.netId === 0x89 ?
                         <small>POLYGON</small> :
                         <small style={{color: "red"}}>WRONG NETWORK</small>

                       )
                     )
                   }
                   </>
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
      <Center>
      {
        props.netId !== 4 && props.netId !== 0x64 && props.netId !== 0x38 && props.netId !== 0x89 && props.coinbase &&
        <center>
          <p><b>Wrong network</b></p>
          <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" external>Please connect to xDai network</Link></p>
        </center>

      }
      </Center>
    </Box>
  );
};

export default dynamic(NavLinks);
