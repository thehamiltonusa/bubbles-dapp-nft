/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react';
import React from 'react';
import { Link } from 'gatsby';
import ERC1155 from '../contracts/ItemsERC1155.json';
import Web3 from 'web3';
import { profileGraphQL, getProfile, getProfiles, getVerifiedAccounts } from '3box/lib/api';
import { ExternalLinkIcon } from '@chakra-ui/icons'

import makeBlockie from 'ethereum-blockies-base64';

class TokenInfo extends React.Component {

  state = {
    loading: true
  }

  constructor(props){
    super(props);
    this.initWeb3 = this.initWeb3.bind(this);
  }

  componentDidMount = async () => {
    await this.initWeb3();
  }

  initWeb3 = async () => {

    try{
      let web3;
      if(window.location.href.includes("?rinkeby")){
        web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
      } else {
        web3 = new Web3("https://rpc.xdaichain.com/")
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
      const id = window.location.search.split('?tokenId=')[1];
      let uri = await itoken.methods.uri(id).call();
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());
      const creator =  await itoken.methods.creators(id).call();
      const hodler = "0x" //await itoken.methods.creators(id).call();
      const creatorProfile = await this.getProfile(creator);
      const hodlerProfile = await this.getProfile(hodler);

      const obj = {
        metadata: metadata,
        creator: creator,
        hodler: hodler,
        creatorProfile: creatorProfile,
        hodlerProfile: hodlerProfile
      }
      this.setState({
        web3: web3,
        itoken: itoken,
        id: id,
        obj: obj,
        loading: false
      });
    } catch(err){
      console.log(err)
    }

  }

  getProfile = async(address) => {
    const profile = await getProfile(address);
    const blockie = new Image();
    blockie.src = makeBlockie(address);
    let img = blockie.src;
    if(profile.image){
      img = `https://ipfs.io/ipfs/${profile.image[0].contentUrl["/"]}`;
    }
    return({
      profile:profile,
      img: img
    })
  }

  render(){
    const obj = this.state.obj;
    return (

      <Box>
        {
          (
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
                !this.state.obj ?
                (
                  <Box textAlign="center">
                    <Text my="20" fontSize="2xl">
                      No token with that id
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <Center>
                    {
                      (
                        obj.metadata.image.includes('ipfs://') ?
                        (
                          <object
                          type="text/html"
                          data={`https://ipfs.io/ipfs/${obj.metadata.image.replace("ipfs://","")}`}
                          width="196px"
                          style={{borderRadius: "100px"}}>
                          </object>
                        ) :
                        (
                          <img src={obj.metadata.image} width='196px' alt="" />
                        )
                      )
                    }

                    </Center>
                    <Center>
                    <Text my="20" fontSize="2xl">
                      <p>Name: {obj.metadata.name}</p>
                      <p>Description: {obj.metadata.description}</p>
                      <p>Creator: <Link to={`/saved-blobs/?address=${obj.creator}`}>
                      <img src={obj.creatorProfile.img} width='20px' alt="" style={{borderRadius:"100px",display: 'inline'}}/>
                      {
                        (
                          obj.creatorProfile?.profile.name ?
                          (
                            obj.creatorProfile.profile.name
                          ) :
                          (
                            obj.creator
                          )
                        )
                      }
                      </Link></p>
                      <p><Link href={`https://epor.io/tokens/${this.state.itoken.options.address}/${this.state.id}`} target="_blank">View on Epor.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></p>
                      <p><Link href={`https://unifty.io/xdai/collectible.html?collection=${this.state.itoken.options.address}&id=${this.state.id}`} target="_blank">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></p>

                    </Text>
                    </Center>
                  </Box>
                )
            )
          )
        }
      </Box>
    );
  }
}
export default TokenInfo;
