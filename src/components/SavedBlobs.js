/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Divider,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Text,
  Flex,
  Heading,
  Spinner,
  Center
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons'

import React, { useEffect } from 'react';
import { dynamic } from '../state';
import Blob from './Blob';
import { Link } from 'gatsby';
import ERC1155 from '../contracts/ItemsERC1155.json';
import Web3 from 'web3';
import { profileGraphQL, getProfile, getProfiles, getVerifiedAccounts } from '3box/lib/api';
import makeBlockie from 'ethereum-blockies-base64';


class SavedBlobs extends React.Component {

  state = {
    savedBlobs: [],
    loading: true
  }

  constructor(props){
    super(props);
    this.initWeb3 = this.initWeb3.bind(this);
    this.handleEvents = this.handleEvents.bind(this);
  }

  componentDidMount = async () => {
    await this.initWeb3();
  }

  initWeb3 = async () => {
    try{
      let coinbase
      let web3;
      if(window.ethereum){
        await window.ethereum.enable();
        web3 = new Web3(window.ethereum);
        coinbase = await web3.eth.getCoinbase();
      } else {
        if(window.location.href.includes("?rinkeby")){
          web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
        } else {
          web3 = new Web3("https://rpc.xdaichain.com/")
        }
      }

      const netId = await web3.eth.net.getId();
      let itoken;
      if(netId !== 4 && netId !== 0x64){
        alert('Connect to xDai or Rinkeby testnet');
      } else if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
      }

      let address = window.location.search.split('?address=')[1];
      if(!address && coinbase){
        address = coinbase;
      }
      const profile = await getProfile(address);
      console.log(profile)
      const blockie = new Image();
      blockie.src = makeBlockie(address);
      let img = blockie.src;
      if(profile.image){
        img = `https://ipfs.io/ipfs/${profile.image[0].contentUrl["/"]}`;
      }
      this.setState({
        web3: web3,
        itoken: itoken,
        profile: profile,
        address:address,
        img: img
      })
      const lastId = await itoken.methods.totalSupply().call();
      console.log(lastId)
      const promises = [];
      for(let i = 1;i<=lastId;i++){
        const creator = await itoken.methods.creators(i).call();
        if(creator.toLowerCase() === address.toLowerCase()){
          const res = {
            returnValues: {
              _id: i
            }
          }
          promises.push(this.handleEvents(null,res))
        }
      }
      await Promise.all(promises);

      this.setState({
        loading: false
      });
      itoken.events.TransferSingle({
        filter: {
          from: '0x0000000000000000000000000000000000000000',
          to: address
        },
        fromBlock: 'latest'
      }, this.handleEvents);
    }catch(err){
      console.log(err)
    }
  }

  handleEvents = async (err, res) => {
    try {
      console.log(res)
      const web3 = this.state.web3;
      let uri = await this.state.itoken.methods.uri(res.returnValues._id).call();
      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      console.log(uri)
      console.log(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text())
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());


      console.log(metadata)
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }
      if (!this.state.savedBlobs.includes(JSON.stringify(obj))) {
        this.state.savedBlobs.unshift(JSON.stringify(obj));
        await this.forceUpdate();
      }
    } catch (err) {
      console.log(err);
    }
  }
  render(){
    return (
      <Box>
        <Flex wrap="wrap" flex="1">
          <Flex
            align="center"
            justify="center"
            direction="column"
            my="4"
            w="full"
            display={{ base: 'flex', lg: 'flex' }}
          >
            <Heading fontSize="3xl" variant="">
              <a href={`https://3box.io/${this.state.address}`} target="_blank" rel="noreferrer">
                <center style={{wordBreak: 'break-word'}}>
                <img src={this.state.img} width='60px' alt="" style={{borderRadius:"100px"}}/>
                {
                  (
                    !this.state.profile?.name ?
                    (
                      this.state.address
                    ) :
                    (
                      this.state.profile.name
                    )
                  )
                }
                </center>
              </a>
            </Heading>
          </Flex>
          <Box
            w={{ base: '100%'}}
            justifyContent="center"
            alignItems="center"
            display="flex"
            flexDirection="column"
          >
            <Text>
            {
              (
                this.state.profile &&
                (
                  <p>{this.state.profile.description}</p>
                )
              )
            }
            </Text>
          </Box>

        </Flex>
        <Heading fontSize="3xl" variant="">Gallery</Heading>
        {
          this.state.loading ?
          (
            <Box textAlign="center">
              <Spinner my="15"/>
              <Text my="2" fontSize="2xl">
                Loading ...
              </Text>
            </Box>
          ) :
          (
            this.state.savedBlobs?.length === 0 ?
            (
              <Box textAlign="center">
                <Text my="20" fontSize="2xl">
                  No minted Bubbles found!
                </Text>
              </Box>
            ) :
            (
              <SimpleGrid
                columns={{ sm: 2, md: 4 }}
                spacing="40px"
                mb="20"
                justifyContent="center"
              >

              {
                this.state.savedBlobs?.map((string) => {
                  const blob = JSON.parse(string);
                  return(
                    <Box
                      rounded="2xl"
                      p="5"
                      borderWidth="1px"
                      _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
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
                      {
                        blob.metadata.attributes.map(item => {
                          return(<p><small>{item.trait_type} : {item.value}</small></p>)
                        })
                      }
                      <p><small><Link href={`https://epor.io/tokens/${this.state.itoken.options.address}/${blob.returnValues._id}`} target="_blank">View on Epor.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                      <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${this.state.itoken.options.address}&id=${blob.returnValues._id}`} target="_blank">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                      </Text>
                    </Box>
                  )
                })
              }
              </SimpleGrid>
            )
          )
        }


      </Box>
    );
  }
}
export default dynamic(SavedBlobs, ['savedBlobs']);
