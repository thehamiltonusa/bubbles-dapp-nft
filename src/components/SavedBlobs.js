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
  Spinner
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { dynamic } from '../state';
import Blob from './Blob';
import { Link } from 'gatsby';
import ERC721 from '../contracts/ItemsERC721.json';
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
          web3 = new Web3("https://bsc-dataseed.binance.org/")
        }
      }

      const netId = await web3.eth.net.getId();
      let itoken;
      if(netId !== 4 && netId !== 56){
        alert('Connect to Binance Smart Chain mainnet or Rinkeby testnet');
      } else if(netId === 4){
        itoken = new web3.eth.Contract(ERC721.abi, ERC721.rinkeby);
      } else if(netId === 56){
        itoken = new web3.eth.Contract(ERC721.abi, ERC721.binance);
      }

      let address = window.location.search.split('?address=')[1];
      if(!address && coinbase){
        address = coinbase;
      }
      const profile = await getProfile(address);
      const blockie = new Image();
      blockie.src = makeBlockie(address);
      let img = blockie.src;
      if(profile.image){
        img = profile.image
      }
      this.setState({
        web3: web3,
        itoken: itoken,
        profile: profile,
        address:address,
        img: img
      })
      const lastId = await itoken.methods.totalSupply().call();
      const promises = [];
      for(let i = 1;i<=lastId;i++){
        const tokenOwner = await itoken.methods.ownerOf(i).call();
        if(tokenOwner.toLowerCase() === coinbase.toLowerCase()){
          const res = {
            returnValues: {
              tokenId: i
            }
          }
          promises.push(this.handleEvents(null,res))
        }
      }
      await Promise.all(promises);

      this.setState({
        loading: false
      });
      itoken.events.Transfer({
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
      const web3 = this.state.web3;
      let uri = await this.state.itoken.methods.tokenURI(res.returnValues.tokenId).call();
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
                <img src={this.state.img} width='20px' alt="" style={{borderRadius:"100px"}}/>
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
                      <LinkBox
                        // h="200"
                        rounded="2xl"
                        p="5"
                        borderWidth="1px"
                        _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
                        role="group"
                        as={Link}
                        to={`/token-info/?tokenId=${blob.returnValues.tokenId}`}
                      >
                        <Text
                          fontSize="sm"
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <LinkOverlay
                            style={{ textTransform: 'uppercase', fontWeight: 600 }}
                            href={blob.url}
                          >
                            {blob.metadata.name}
                          </LinkOverlay>
                        </Text>
                        <Divider mt="4" />
                        {
                          (
                            blob.metadata.image.includes('ipfs://') ?
                            (
                              <center>
                                <object type="text/html"
                                data={`https://ipfs.io/ipfs/${blob.metadata.image.replace("ipfs://","")}`}
                                width="196px"
                                style={{borderRadius: "100px"}}>
                                </object>
                              </center>
                            ) :
                            (
                              <center>
                                <img src={blob.metadata.image} width='196px' alt=""  style={{borderRadius: "100px"}} />
                              </center>
                            )
                          )
                        }
                      </LinkBox>
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
