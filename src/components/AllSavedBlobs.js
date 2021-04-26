/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Divider,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Text,
  Spinner,
  Center,
  Image,
  useColorModeValue
} from '@chakra-ui/react';

import React, { useEffect } from 'react';
import { Link } from 'gatsby';
import { dynamic } from '../state';
import Blob from './Blob';
import ERC1155 from '../contracts/ItemsERC1155.json';
import LikesERC1155 from '../contracts/ERC1155Likes.json';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider'


class SavedBlobs extends React.Component {

  state = {
    savedBlobs: [],
    loading: true,
    hasLiked: [],
    likes: [],
    loadingLikes: []
  }

  constructor(props){
    super(props);
    this.initWeb3 = this.initWeb3.bind(this);
    this.handleEvents = this.handleEvents.bind(this);
    this.handleLikes = this.handleLikes.bind(this);

  }

  componentDidMount = async () => {
    await this.initWeb3();
    this.setState({
      loading:false
    })
  }

  initWeb3 = async () => {
    try{
      let web3;
      if(window.location.href.includes("?rinkeby")){
        web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
      } else {
        web3 = new Web3("https://rpc.xdaichain.com/")
      }
      let provider;
      let coinbase;
      const hasLogged = localStorage.getItem('logged');
      if(hasLogged){
        if(window.ethereum?.isMetamask){
          provider = await detectEthereumProvider();
          if(!provider._metamask.isUnlocked()){
            alert("Please unlock your metamask first");
            this.setState({
              loading: false
            });
            return
          }
        } else {
          provider = window.ethereum;
        }
        await provider.request({ method: 'eth_requestAccounts' });
        web3 = new Web3(provider);
        coinbase = await web3.eth.getCoinbase();

        provider.on('accountsChanged', accounts => window.location.reload(true));
        provider.on('chainChanged', chainId => window.location.reload(true));
      }
      const netId = await web3.eth.net.getId();
      let itoken;
      let itokenLikes;
      if(netId !== 4 && netId !== 0x64){
        alert('Connect to Xdai or Rinkeby testnet');
      } else if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
        itokenLikes = new web3.eth.Contract(LikesERC1155.abi, LikesERC1155.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
        itokenLikes = new web3.eth.Contract(LikesERC1155.abi, LikesERC1155.xdai);
      }

      this.setState({
          web3: web3,
          itoken: itoken,
          itokenLikes: itokenLikes,
          coinbase:coinbase
      });
      const lastId = await itoken.methods.totalSupply().call();
      const promises = [];
      for(let i = 1;i<=lastId;i++){
        const res = {
          returnValues: {
            _id: i
          }
        }
        promises.push(this.handleEvents(null,res))
      }
      await Promise.all(promises);


      this.setState({
        loading: false
      });

      itoken.events.TransferSingle({
        filter: {
          from: '0x0000000000000000000000000000000000000000'
        },
        fromBlock: 'latest'
      }, this.handleEvents);

      if(itokenLikes){
        itokenLikes.events.LikeOrUnlike({
          filter: {
          },
          fromBlock: 'latest'
        }, this.handleLikes);
      }

    } catch(err){
      console.log(err)
    }

  }

  handleEvents = async (err, res) => {
    try {
      const web3 = this.state.web3;
      let uri = await this.state.itoken.methods.uri(res.returnValues._id).call();
      let likes = 0;
      let liked;
      if(this.state.itokenLikes){
        likes = await this.state.itokenLikes.methods.likes(res.returnValues._id).call();
        if(this.state.coinbase){
          liked = await this.state.itokenLikes.methods.liked(this.state.coinbase,res.returnValues._id).call();
        }
      }

      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }

      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());


      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }
      if (!this.state.savedBlobs.includes(JSON.stringify(obj))) {
        this.state.savedBlobs.push(JSON.stringify(obj));
      }
      this.state.likes[obj.returnValues._id] =  {
                                                  likes: likes,
                                                  liked: liked
                                                };
      await this.forceUpdate();
    } catch (err) {
      console.log(err);
    }
  }

  handleLikes = async (err,res) => {

    let likes = 0;
    let liked;
    if(this.state.itokenLikes){
      likes = await this.state.itokenLikes.methods.likes(res.returnValues.id).call();
      if(this.state.coinbase){
        liked = await this.state.itokenLikes.methods.liked(this.state.coinbase,res.returnValues.id).call();
      }
    }

    this.state.loadingLikes[res.returnValues.id] =  true
    await this.forceUpdate();
    this.state.likes[res.returnValues.id] =  {
                                                likes: likes,
                                                liked: liked
                                              };
    this.state.loadingLikes[res.returnValues.id] =  false
    await this.forceUpdate();
  }

  like = async(id) => {
    try{
      this.state.loadingLikes[id] =  true
      await this.forceUpdate();
      await this.state.itokenLikes.methods.like(id).send({
        from: this.state.coinbase,
        gasPrice: 1000000000
      });
    } catch(err){
      console.log(err)
    }
    this.state.loadingLikes[id] =  false
    await this.forceUpdate();
  }

  unlike = async(id) => {
    try{
      this.state.loadingLikes[id] =  true
      await this.forceUpdate();
      await this.state.itokenLikes.methods.unlike(id).send({
        from: this.state.coinbase,
        gasPrice: 1000000000
      });
    } catch(err){
      console.log(err)
    }
    this.state.loadingLikes[id] =  false
    await this.forceUpdate();
  }

  render(){
    return (
      <Box>
        {
          (
            this.state.loading ?
            (
              <Box textAlign="center">
                <Spinner />
                <Text my="20" fontSize="2xl">
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
                  columns={{ sm: 1, md: 5  }}
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
                          <LinkBox
                            // h="200"
                            role="group"
                            as={Link}
                            to={`/token-info/?tokenId=${blob.returnValues._id}`}
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
                            <center>
                              <object type="text/html"
                              data={`https://ipfs.io/ipfs/${blob.metadata.image.replace("ipfs://","")}`}
                              width="196px"
                              style={{borderRadius: "100px"}}>
                              </object>
                            </center>

                          </LinkBox>
                          <Divider mt="4" />
                          <Center>
                            <Text>
                              <p>Likes: {this.state.likes[blob.returnValues._id].likes}</p>
                            </Text>
                          </Center>
                          <Center>

                          {
                            (
                              this.state.coinbase &&
                              (
                                !this.state.loadingLikes[blob.returnValues._id] ?
                                (
                                  !this.state.likes[blob.returnValues._id].liked ?
                                  (
                                    <Button
                                      variant="heavy"
                                      leftIcon={<Image boxSize="25px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAC3UlEQVRoge2ZPWgUQRTHf2f0NBYGJTYSxELwExKCwYA2KgiKpFHsLC1EMViIFiIGK7HRRkUQJJigCGJhYaEoKIqNBDvNKRJN/Iz4hacYE4t3x769u72dm7nb2eJ+sDDsvPvP/92+/ZgZaNIk9cwBTgHvgXfAHWCHV0c1chqYqXAM+DRlSjuQp3ICM8ABf9bM2ENg9gnQAVxX574Bbd7cGTBEYPZo4VwWeKnO7/VjLZ4W4DOB0S7V16/OX03emhm9BCbHgYzq61R9z10GmeXy4xi2qfZtxGyRV6q9pIEenHhK8C/vKunLqr58wr6M6CMw+JvyJ02H6p9M1lo8C4EJAoMXKsRsVf0jyVkz4zKBuQkkoVIOqZjB5KzFs53wm7YvIu6GitmfjLV42oAxAmNXIuJmA19V3IpE3BlwicDUR2BxRNwGFfc6GWvxbAGmCYztrBI7oOIuNtpYa2HAHDBFuL6jjmsxmo+r/PYv8BYYRq6Us/mHhqZNSqfI9xr0ziH3jBX6Upseuw10TyIvN1PN87YJ5JTIYWRqWAk9mCstwFrgVonuRhsxXfPZKnH1TKBIBripdIdtREyNNSIBgG6lO2Yj4DuBBUr3V1RQI+cDrixV7S9RQWlOYL1qR36xpjmBzap9z0bA9z0wrnS7bQR8JrBKaU5SpVLSWkK6fO4jH4oVSWsCm1Tbqv7BXwllgE9Kc42tkK8EupTeB8ILYmWksYR0/d8l5o9JYwJ1qX/wU0LzgR9Kb7mLmI8E9imtZ65iJvMBvcb5D1jkMN4ywsvx/Q5aQHhGdoTyJLLIpoW+AtPIcvkgsn3UQ/RMTrOyZLwcMNc1gRMl5myPPPAIOItsOa1GJuqtyBfnGcL7aHlgnat5qG1VYgTZA/vjmOxPZOG3bswDjgOjlK8LTQEvgGOFOJDL3gscRPbHRmsw/wD5iKuJqm+5OtGO3As9SGl0IrOtPPAGMT6E4zO/SRNL/gNVZHTiig40MgAAAABJRU5ErkJggg=="/>}
                                      aria-label="Like it"
                                      onClick={() => {
                                        this.like(blob.returnValues._id)
                                      }}
                                    >
                                      like it
                                    </Button>
                                  ):
                                  (
                                    <Button
                                      variant="heavy"
                                      aria-label="Unlike it"
                                      onClick={() => {
                                        this.unlike(blob.returnValues._id)
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
                          }
                          </Center>
                        </Box>
                      )
                    })
                  }
                </SimpleGrid>
              )

            )
          )
        }

      </Box>
    );
  }
}
export default dynamic(SavedBlobs, ['savedBlobs']);
