/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Divider,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  VStack,
  Text,
  Spinner,
  Center,
  Image,
  Select,
  Heading,
  Avatar,
  useColorModeValue
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons'

import React, { useMemo,useState } from 'react';
import { Link } from 'react-router-dom';
import { dynamic } from '../state';
import Blob from './Blob';

import makeBlockie from 'ethereum-blockies-base64';
import useContract from '../hooks/useContract';
import useWeb3Modal from '../hooks/useWeb3Modal';

function AllSavedBlobs(){

  const {provider,coinbase,netId,profile,connecting,loadWeb3Modal} = useWeb3Modal();
  const {token,creators,nfts,loadingNFTs,myNfts,myOwnedNfts,totalSupply,getMetadata} = useContract();

  const [hasLiked,setHasLiked] = useState([]);
  const [likes,setLikes] = useState([]);
  const [loadingLikes,setLoadingLikes] = useState([]);
  const [pages,setPages] = useState();
  const [lastSupply,setLastSupply] = useState();

  useMemo(() => {
    if(totalSupply !== lastSupply){
      const totalPages = (totalSupply/10);
      const newPages = [];
      for(let i = 0;i<totalPages;i++){
        newPages.push(i);
      }
      setPages(pages)
    }
  },[
    totalSupply,
    pages
  ])

  return(
    <Box>
    <VStack spacing={12}>
      {

          loadingNFTs  &&

            <Box textAlign="center">
              <Spinner />
              <Text fontSize="2xl">
                Loading ...
              </Text>
            </Box>

      }
      {
        myNfts?.length === 0 ?

        <Box textAlign="center">
          <Text my="20" fontSize="2xl">
            No minted Bubbles found!
          </Text>
        </Box> :
        <>
        <Box>
        <SimpleGrid
          columns={{ sm: 1, md: 5  }}
          spacing="40px"
          mb="20"
          justifyContent="center"
        >
        {
          myNfts?.map((string) => {
            const blob = JSON.parse(string);
            return(
              <Box
                rounded="2xl"
                p="5"
                borderWidth="1px"
                _hover={{ boxShadow: '2xl' }}
              >
                <Heading
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                    {blob.metadata.name}
                </Heading>
                <Divider mt="4" />
                <Center>
                  <object type="text/html"
                  data={`https://ipfs.io/ipfs/${blob.metadata.image.replace("ipfs://","")}`}
                  width="196px"
                  style={{borderRadius: "100px"}}>
                  </object>
                </Center>
                <Divider mt="4" />
                {
                  (
                    blob.metadata.description &&
                    (
                      <>
                      <Text>
                      <b>{blob.metadata.description}</b>
                      </Text>
                      <Divider mt="4" />
                      </>
                    )
                  )
                }

                <Text>
                <p><small>Token ID: {blob.returnValues._id}</small></p>
                <p style={{
                  whiteSpace: "nowrap",
                  width: "100%",                   /* IE6 needs any width */
                  overflow: "hidden",              /* "overflow" value must be different from  visible"*/
                  oTextOverflow: "ellipsis",    /* Opera < 11*/
                  textOverflow:   "ellipsis",    /* IE, Safari (WebKit), Opera >= 11, FF > 6 */
                }}>
                  <small>Creator: <Link to={`/saved-blobs/?address=${blob.creator}`}><Avatar src={makeBlockie(blob.creator)} size='2xs' alt="" />{' '}{blob.creator}</Link></small>
                </p>
                <p><small><a href={`https://unifty.io/xdai/collectible.html?collection=${token.address}&id=${blob.returnValues._id}`} target="_blank" rel="noreferrer">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></a></small></p>
                </Text>
                <Divider mt="4" />
                <Center>
                  <Text>
                    <p>Likes: {likes[blob.returnValues._id]?.likes}</p>
                  </Text>
                </Center>
              </Box>
            )
          })
        }
        </SimpleGrid>
        </Box>
        </>
      }
      </VStack>
    </Box>
  )
}

export default dynamic(AllSavedBlobs, ['savedBlobs']);
