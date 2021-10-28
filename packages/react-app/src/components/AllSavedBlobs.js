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
import makeBlockie from 'ethereum-blockies-base64';

import { dynamic } from '../state';
import Blob from './Blob';

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
        nfts?.length === 0 ?

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
          nfts?.map((string) => {
            const blob = JSON.parse(string);
            if(blob.address.toLowerCase() !== token.address.toLowerCase()){
              return
            }
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
                  <small>Creator: <a href={`https://self.id/${blob.creator}`} target="_blank" rel="noreferrer"><Avatar src={makeBlockie(blob.creator)} size='2xs' alt="" />{' '}{blob.creator}</a></small>
                </p>
                {
                  netId === 0x89 &&
                  <p><small><a href={`https://opensea.io/assets/matic/${token.address}/${blob.returnValues._id}`} target="_blank" rel="noreferrer">View on Opensea{' '}<ExternalLinkIcon fontSize="18px" /></a></small></p>
                }
                <p><small><a href={`https://unifty.io/${netId === 4 ? "rinkeby" : netId === 0x89 ? "matic" : netId === 0x38 ? "bsc" : "xdai"}/collectible.html?collection=${token.address}&id=${blob.returnValues._id}`} target="_blank" rel="noreferrer">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></a></small></p>
                </Text>
                <Divider mt="4" />
                <Center>
                  <Text>
                    {/*<p>Likes: {likes[blob.returnValues._id]?.likes}</p>*/}
                  </Text>
                </Center>
                <Center>

                {
                  /*
                  (
                    coinbase &&
                    (
                      !loadingLikes[blob.returnValues._id] ?
                      (
                        !likes[blob.returnValues._id]?.liked ?
                        (
                          <Button
                            variant="heavy"
                            leftIcon={<Image boxSize="25px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAC3UlEQVRoge2ZPWgUQRTHf2f0NBYGJTYSxELwExKCwYA2KgiKpFHsLC1EMViIFiIGK7HRRkUQJJigCGJhYaEoKIqNBDvNKRJN/Iz4hacYE4t3x769u72dm7nb2eJ+sDDsvPvP/92+/ZgZaNIk9cwBTgHvgXfAHWCHV0c1chqYqXAM+DRlSjuQp3ICM8ABf9bM2ENg9gnQAVxX574Bbd7cGTBEYPZo4VwWeKnO7/VjLZ4W4DOB0S7V16/OX03emhm9BCbHgYzq61R9z10GmeXy4xi2qfZtxGyRV6q9pIEenHhK8C/vKunLqr58wr6M6CMw+JvyJ02H6p9M1lo8C4EJAoMXKsRsVf0jyVkz4zKBuQkkoVIOqZjB5KzFs53wm7YvIu6GitmfjLV42oAxAmNXIuJmA19V3IpE3BlwicDUR2BxRNwGFfc6GWvxbAGmCYztrBI7oOIuNtpYa2HAHDBFuL6jjmsxmo+r/PYv8BYYRq6Us/mHhqZNSqfI9xr0ziH3jBX6Upseuw10TyIvN1PN87YJ5JTIYWRqWAk9mCstwFrgVonuRhsxXfPZKnH1TKBIBripdIdtREyNNSIBgG6lO2Yj4DuBBUr3V1RQI+cDrixV7S9RQWlOYL1qR36xpjmBzap9z0bA9z0wrnS7bQR8JrBKaU5SpVLSWkK6fO4jH4oVSWsCm1Tbqv7BXwllgE9Kc42tkK8EupTeB8ILYmWksYR0/d8l5o9JYwJ1qX/wU0LzgR9Kb7mLmI8E9imtZ65iJvMBvcb5D1jkMN4ywsvx/Q5aQHhGdoTyJLLIpoW+AtPIcvkgsn3UQ/RMTrOyZLwcMNc1gRMl5myPPPAIOItsOa1GJuqtyBfnGcL7aHlgnat5qG1VYgTZA/vjmOxPZOG3bswDjgOjlK8LTQEvgGOFOJDL3gscRPbHRmsw/wD5iKuJqm+5OtGO3As9SGl0IrOtPPAGMT6E4zO/SRNL/gNVZHTiig40MgAAAABJRU5ErkJggg=="/>}
                            aria-label="Like it"
                            onClick={() => {
                              //like(blob.returnValues._id)
                            }}
                          >
                            Like it
                          </Button>
                        ):
                        (
                          <Button
                            variant="heavy"
                            aria-label="Unlike it"
                            onClick={() => {
                              //unlike(blob.returnValues._id)
                            }}
                          >
                            <Image boxSize="25px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABJ0lEQVRIie3UsSuFYRTH8Q/uILtbDEzsEpMk2y13MIlBBuVfMBopE4tSMpDMZgwWZVTKIOUWWVGSWwz3eev1dnlc3lsGvzqd87yn5/c9w3kf/pBacI87bKM/b0Af3lLxhKE8AXPB+AKnoT6MXWptADAS8hnWQj2cF2Aes6E+V5seXn4LaMUqNlHAPi7RG/pXMUDhi14HdjCJKtZxFHoDIR/HAGkl25FoN5wfsIiJEGXc+rhR6aiglJi0ZADpb89ox0IwTDSIpciwFfTEAMm5HDHL6iDt08ia/kh5A4ohPzYLMBXyXjMARYzjFcvNAMyo/VdbuM4b0IUxtelX0o28ANNok5k+L0A3RtWZPqvsU1Hx+XNQLzZik2QBJdx8w7iKE3TGAP+qq3d99VWqfM7/ZgAAAABJRU5ErkJggg=="/>
                          </Button>
                        )
                      ) :
                      (
                        <Spinner />
                      )

                    )
                  )
                  */
                }
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
